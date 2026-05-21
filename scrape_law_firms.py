import requests
import re
import csv
import time

SERPER_API_KEY = "fe79900780380cae6f9f6784dc47a867eb3d454c"
OUTPUT_FILE = "law_firms_ny.csv"

def search_maps(query):
    url = "https://google.serper.dev/maps"
    headers = {"X-API-KEY": SERPER_API_KEY, "Content-Type": "application/json"}
    payload = {"q": query, "location": "New York, NY", "num": 20}
    res = requests.post(url, headers=headers, json=payload, timeout=15)
    res.raise_for_status()
    return res.json().get("places", [])

def extract_emails_from_url(url):
    if not url:
        return ""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; research-bot/1.0)"}
        res = requests.get(url, headers=headers, timeout=10, allow_redirects=True)
        if res.status_code != 200:
            return ""
        emails = re.findall(r"[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}", res.text)
        filtered = [e for e in set(emails) if not any(skip in e.lower() for skip in
                    ["example", "yourdomain", "domain.com", "email.com", "sentry", "wixpress", "schema"])]
        return "; ".join(filtered[:5])
    except Exception:
        return ""

def main():
    print("Searching Google Maps for Law Firms in New York...")
    places = search_maps("Law Firms New York")
    print(f"Found {len(places)} results")

    rows = []
    for place in places:
        name    = place.get("title", "")
        phone   = place.get("phoneNumber", "")
        website = place.get("website", "")

        print(f"  Processing: {name} — {website or 'no website'}")
        email = extract_emails_from_url(website)
        rows.append({"name": name, "website": website, "phone": phone, "email": email})
        time.sleep(1)

    with open(OUTPUT_FILE, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["name", "website", "phone", "email"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"\nDone. {len(rows)} records saved to {OUTPUT_FILE}")

if __name__ == "__main__":
    main()
