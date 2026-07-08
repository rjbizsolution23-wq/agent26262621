# =============================================================================
# Sovereign Startup Builder & AI Swarm Pitch Suite — FastAPI Backend Controller
# Built by RJ Business Solutions for NeuronEdge Labs Inc.
# 📍 1342 NM 333, Tijeras, New Mexico 87059
# 🌐 https://rickjeffersonsolutions.com
# =============================================================================

import os
import json
import requests
from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import HTMLResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="Sovereign Startup Builder & AI Swarm Pitch Suite")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Resolve paths
STATIC_PATH = os.path.dirname(os.path.abspath(__file__))
os.makedirs(STATIC_PATH, exist_ok=True)

class StartupIdeaRequest(BaseModel):
    idea: str
    founder_name: str = "Ricky Jefferson"

@app.post("/api/generate-docs")
def generate_startup_pack(req: StartupIdeaRequest):
    """Calls OpenRouter LLM swarm router to compile a business idea into 18 founder variables."""
    api_key = os.getenv("OPENROUTER_API_KEY")
    if not api_key:
        raise HTTPException(
            status_code=500,
            detail="OpenRouter API key is not configured on the server. Please add it to your .env file."
        )

    # Elaborate system instructions requesting all 18 doc variables in a strict JSON schema
    system_prompt = (
        "You are the Startup Swarm Architect. You translate a raw business idea into a highly cohesive, "
        "structured set of corporate, legal, financial, and VC pitch parameters. "
        "Your response MUST be a single, valid JSON object with NO markdown formatting, NO explanation, "
        "and NO additional characters outside the JSON payload.\n\n"
        "FIELDS TO GENERATE:\n"
        "1. companyName: String (professional corporate name, e.g. 'Apex Grid Inc.')\n"
        "2. agreementDate: String YYYY-MM-DD\n"
        "3. founder1Name: String (use user's provided founder name)\n"
        "4. founder1Role: String (e.g. 'CEO & President')\n"
        "5. founder1Equity: Number (e.g. 35)\n"
        "6. founder2Name: String (co-founder name)\n"
        "7. founder2Role: String (e.g. 'CSO')\n"
        "8. founder2Equity: Number (e.g. 30)\n"
        "9. founder3Name: String (co-founder name)\n"
        "10. founder3Role: String (e.g. 'Chief AI Architect')\n"
        "11. founder3Equity: Number (e.g. 20)\n"
        "12. founder4Name: String (co-founder name)\n"
        "13. founder4Role: String (e.g. 'COO')\n"
        "14. founder4Equity: Number (e.g. 15) // Note: founder1 + founder2 + founder3 + founder4 equity must sum exactly to 100\n"
        "15. vestingYears: Number (default 4)\n"
        "16. cliffYears: Number (default 1)\n"
        "17. filingNumber: String (mock ID starting with year, e.g. '2026-001234567')\n"
        "18. ein: String (mock EIN format XX-XXXXXXX)\n"
        "19. registeredAgent: String (default 'Wyoming Corporate Services Inc.')\n"
        "20. regOffice: String (default '1712 Pioneer Ave, Cheyenne, WY 82001')\n"
        "21. authorizedShares: Number (default 10000000)\n"
        "22. nonCompeteMonths: Number (default 12)\n"
        "23. resolutionJurisdiction: String (default 'Cheyenne, Wyoming, USA')\n"
        "24. boardMembersCount: Number (default 4)\n"
        "25. reservedMattersConsent: Number (default 75)\n"
        "26. authCapital: Number (default 10000000)\n"
        "27. founder1Shares: Number (authorizedShares * founder1Equity / 100)\n"
        "28. founder2Shares: Number (authorizedShares * founder2Equity / 100)\n"
        "29. founder3Shares: Number (authorizedShares * founder3Equity / 100)\n"
        "30. founder4Shares: Number (authorizedShares * founder4Equity / 100)\n"
        "31. investorShares: Number (e.g. 1000000)\n"
        "32. esopPoolShares: Number (e.g. 1000000)\n"
        "33. employeeName: String (mock employee, e.g. 'Alice Adams')\n"
        "34. designation: String (technical role, e.g. 'Senior ML Engineer')\n"
        "35. grantDate: String YYYY-MM-DD\n"
        "36. optionsCount: Number (e.g. 100000)\n"
        "37. exercisePrice: Number (e.g. 0.10)\n"
        "38. disclosingParty: String (same as companyName)\n"
        "39. receivingParty: String (mock VC name, e.g. 'BlueStar Ventures LLC')\n"
        "40. purpose: String (customized to the company's domain, e.g. 'Evaluating Series Seed financing for solar web portal')\n"
        "41. termYears: Number (default 3)\n"
        "42. governingLaw: String (default 'Cheyenne, Wyoming, USA')\n"
        "43. assignorName: String (same as founder1Name)\n"
        "44. ipDescription: String (custom IP transfer statement detailing code/models for this specific idea)\n"
        "45. executionDate: String YYYY-MM-DD\n"
        "46. trademarkNo: String (mock USPTO registration number)\n"
        "47. applicationNo: String (mock USPTO application serial)\n"
        "48. proprietorName: String (same as companyName, in all caps)\n"
        "49. brandName: String (same as companyName, in all caps, without suffix)\n"
        "50. classNo: Number (default 42)\n"
        "51. registrationDate: String YYYY-MM-DD\n"
        "52. monthlyBasic: Number (monthly base salary, e.g. 12000)\n"
        "53. bonusRate: Number (bonus percentage, e.g. 15)\n"
        "54. candidateName: String (same as employeeName)\n"
        "55. jobTitle: String (same as designation)\n"
        "56. joiningDate: String YYYY-MM-DD\n"
        "57. leaveDays: Number (default 20)\n"
        "58. probationMonths: Number (default 3)\n"
        "59. websiteUrl: String (mock domain, e.g. 'https://solarexgrid.io')\n"
        "60. governingJurisdiction: String (default 'Cheyenne, Wyoming, USA')\n"
        "61. contactEmail: String (e.g. 'privacy@solarexgrid.io')\n"
        "62. annualReportStatus: String (default 'Completed')\n"
        "63. einStatus: String (default 'Completed')\n"
        "64. franchiseTaxStatus: String (default 'Completed')\n"
        "65. registeredAgentStatus: String (default 'Active')\n"
        "66. problem: String (a highly compelling Problem slide text for pitch decks based on this idea)\n"
        "67. solution: String (a highly compelling Solution slide text detailing how this business solves the problem)\n"
        "68. askAmount: String (mock round text, e.g. 'Raise $1.5M Seed Round at $8.5M Pre-Money Valuation')\n"
        "69. initialRev: Number (Year 1 initial revenue estimate, e.g. 500000)\n"
        "70. growthRate: Number (estimated growth rate percentage, e.g. 40)\n"
        "71. cogsRate: Number (estimated COGS cost percentage, e.g. 15)\n"
        "72. opexRate: Number (estimated OpEx cost percentage, e.g. 30)\n"
        "73. investorName: String (same as receivingParty without LLC/LP)\n"
        "74. investmentAmount: Number (parsed numeric ask amount, e.g. 1500000)\n"
        "75. preMoneyVal: Number (parsed numeric valuation, e.g. 8500000)\n"
    )

    url = "https://openrouter.ai/api/v1/chat/completions"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "https://rickjeffersonsolutions.com",
        "X-Title": "Sovereign Startup Builder"
    }

    payload = {
        "model": "google/gemini-2.5-flash", # Fast, structured model
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": f"Startup Idea: {req.idea}\nFounder: {req.founder_name}"}
        ],
        "response_format": {"type": "json_object"},
        "temperature": 0.2
    }

    try:
        res = requests.post(url, json=payload, headers=headers, timeout=60)
        res_data = res.json()
        
        # Extract content
        content = res_data["choices"][0]["message"]["content"].strip()
        parsed_variables = json.loads(content)
        
        # Ensure we return valid structured variables
        return {
            "success": True,
            "variables": parsed_variables
        }
    except Exception as e:
        # Fallback payload in case of api timeouts/errors so the app is resilient
        print(f"[!] Error calling OpenRouter: {e}")
        fallback_company = req.idea.split()[0].title() + " Tech Inc." if len(req.idea.split()) > 0 else "Alpha Innovations Inc."
        return {
            "success": False,
            "error": str(e),
            "variables": {
                "companyName": fallback_company,
                "agreementDate": "2026-06-23",
                "founder1Name": req.founder_name,
                "founder1Role": "CEO & President",
                "founder1Equity": 35,
                "founder2Name": "Dr. Jessica Edwards",
                "founder2Role": "CSO (Chief Scientific Officer)",
                "founder2Equity": 30,
                "founder3Name": "Dr. McKnight",
                "founder3Role": "Chief AI Architect",
                "founder3Equity": 20,
                "founder4Name": "Kurmesha C.",
                "founder4Role": "COO",
                "founder4Equity": 15,
                "vestingYears": 4,
                "cliffYears": 1,
                "filingNumber": "2026-001234567",
                "ein": "12-3456789",
                "registeredAgent": "Wyoming Corporate Services Inc.",
                "regOffice": "1712 Pioneer Ave, Cheyenne, WY 82001",
                "authorizedShares": 10000000,
                "nonCompeteMonths": 12,
                "resolutionJurisdiction": "Cheyenne, Wyoming, USA",
                "boardMembersCount": 4,
                "reservedMattersConsent": 75,
                "authCapital": 10000000,
                "founder1Shares": 3500000,
                "founder2Shares": 3000000,
                "founder3Shares": 2000000,
                "founder4Shares": 1500000,
                "investorShares": 1000000,
                "esopPoolShares": 1000000,
                "employeeName": "Alice Adams",
                "designation": "Lead Cognitive Architect",
                "grantDate": "2026-06-23",
                "optionsCount": 100000,
                "exercisePrice": 0.10,
                "disclosingParty": fallback_company,
                "receivingParty": "BlueStar Ventures LLC",
                "purpose": f"Exploring Series Seed financing for {fallback_company}",
                "termYears": 3,
                "governingLaw": "Cheyenne, Wyoming, USA",
                "assignorName": req.founder_name,
                "ipDescription": f"All database codes and models relating to {req.idea}",
                "executionDate": "2026-06-23",
                "trademarkNo": "7,890,123",
                "applicationNo": "98/765,432",
                "proprietorName": fallback_company.upper(),
                "brandName": fallback_company.upper().replace(" INC.", "").replace(" TECH", ""),
                "classNo": 42,
                "registrationDate": "2026-06-23",
                "monthlyBasic": 12000,
                "bonusRate": 15,
                "candidateName": "Alice Adams",
                "jobTitle": "Lead Cognitive Architect",
                "joiningDate": "2026-07-01",
                "leaveDays": 20,
                "probationMonths": 3,
                "websiteUrl": f"https://{fallback_company.lower().replace(' ', '').replace('.', '')}.io",
                "governingJurisdiction": "Cheyenne, Wyoming, USA",
                "contactEmail": f"privacy@{fallback_company.lower().replace(' ', '').replace('.', '')}.io",
                "annualReportStatus": "Completed",
                "einStatus": "Completed",
                "franchiseTaxStatus": "Completed",
                "registeredAgentStatus": "Active",
                "problem": f"Current systems struggle with: {req.idea}",
                "solution": f"We solve this by building a distributed engine for {req.idea}",
                "askAmount": "Raise $1.5M Seed Round",
                "initialRev": 500000,
                "growthRate": 40,
                "cogsRate": 15,
                "opexRate": 30,
                "investorName": "BlueStar Ventures",
                "investmentAmount": 1500000,
                "preMoneyVal": 8500000
            }
        }

@app.get("/")
def get_index():
    return FileResponse(STATIC_PATH + "/index.html")

# Serve remaining files in directory (index.css, calculator.js, docs_data.js)
app.mount("/", StaticFiles(directory=STATIC_PATH), name="static")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8002, reload=True)
