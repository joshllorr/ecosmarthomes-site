#!/usr/bin/env bash
# ====================================================================
# ECOSMARTHOME "HUB & SPOKE" BUILD VERIFIER
# ====================================================================
# Purpose: Programmatically validates local directories and compiled HTML assets
#          against technical SEO, routing, and payment security standards.
# Usage:   bash verify-ecosmarthomes-build.sh [path-to-build-directory]
# ====================================================================

# Color codes for clean reporting
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color
BOLD='\033[1m'

echo -e "${BLUE}${BOLD}================================================================${NC}"
echo -e "${CYAN}${BOLD}         ECOSMARTHOME BUILD VERIFICATION SUITE (v1.0)          ${NC}"
echo -e "${BLUE}${BOLD}================================================================${NC}"

# Target directory defaults to current directory if not specified
TARGET_DIR="${1:-.}"
# Resolve absolute path
TARGET_DIR=$(cd "$TARGET_DIR" && pwd)

echo -e "Target Workspace: ${YELLOW}${TARGET_DIR}${NC}"
echo -e "Initializing structural checks...\n"

# Verify directory exists
if [ ! -d "$TARGET_DIR" ]; then
    echo -e "${RED}${BOLD}❌ ERROR: Target directory '$TARGET_DIR' does not exist.${NC}"
    exit 1
fi

# Define the 18 structural HTML paths that must exist in the "Hub & Spoke" design
declare -a REQUIRED_PAGES=(
    "index.html"
    "services/index.html"
    "services/heat-pump-readiness.html"
    "services/carbon-tax-analysis.html"
    "services/home-leakiness-audit.html"
    "services/solar-pv-viability.html"
    "tools/index.html"
    "tools/vision-scanner.html"
    "tools/voice-aoife.html"
    "tools/grant-calculator.html"
    "guides/index.html"
    "guides/irish-ber-scale.html"
    "guides/seai-grant-handbook.html"
    "support/faq.html"
    "support/contact.html"
    "checkout/index.html"
    "checkout/order.html"
    "checkout/thank-you.html"
)

CRITICAL_ERRORS=0
WARNINGS=0
PASSED_CHECKS=0

# Step 1: Structural Path Auditing
echo -e "${BLUE}${BOLD}[STAGE 1] Checking the 18 Split-Directory HTML Assets...${NC}"
echo -e "----------------------------------------------------------------"

for PAGE in "${REQUIRED_PAGES[@]}"; do
    FILE_PATH="$TARGET_DIR/$PAGE"
    
    if [ -f "$FILE_PATH" ]; then
        echo -e "  ${GREEN}✔ FOUND:${NC} $PAGE"
        ((PASSED_CHECKS++))
        
        # Content Analysis Checks
        # A. Check for Stripe Test Mode Leaks
        if grep -qE "sk_test_|pk_test_|buy.stripe.com/test_" "$FILE_PATH"; then
            echo -e "    ${RED}❌ CRITICAL ERROR: Stripe Test Mode Key or Link found!${NC}"
            ((CRITICAL_ERRORS++))
        fi
        
        # B. Check for JavaScript Console Routing Crash ("An unknown error occurred")
        if grep -Fq "An unknown error occurred" "$FILE_PATH"; then
            echo -e "    ${RED}❌ CRITICAL ERROR: JavaScript error placeholder 'An unknown error occurred' is hardcoded!${NC}"
            ((CRITICAL_ERRORS++))
        fi

        # C. Check for Canonical URL Tag (Technical SEO requirement)
        if ! grep -Fq "rel=\"canonical\"" "$FILE_PATH"; then
            echo -e "    ${YELLOW}⚠ WARNING: Missing self-referential <link rel=\"canonical\" ... />${NC}"
            ((WARNINGS++))
        else
            ((PASSED_CHECKS++))
        fi

        # D. Check for H1 Header Tag (Ensures content hierarchy isn't broken)
        if ! grep -Fq "<h1" "$FILE_PATH" && ! grep -Fq "role=\"heading\"" "$FILE_PATH"; then
            echo -e "    ${YELLOW}⚠ WARNING: No <h1> header or heading role found on this page.${NC}"
            ((WARNINGS++))
        else
            ((PASSED_CHECKS++))
        fi

        # E. Check for Hardcoded .html links (Should be clean routes in Hub & Spoke)
        if grep -qE "href=\"[^\"]+\.html\"" "$FILE_PATH" | grep -qv "index.html"; then
            BAD_LINKS=$(grep -oE "href=\"[^\"]+\.html\"" "$FILE_PATH" | grep -v "index.html" | tr '\n' ' ')
            echo -e "    ${YELLOW}⚠ PERFORMANCE ADVICE: Hardcoded .html paths detected: $BAD_LINKS${NC}"
            echo -e "                          (Tip: Transition to clean slash routes e.g., /services/heat-pump-readiness/)${NC}"
            ((WARNINGS++))
        fi

    else
        echo -e "  ${RED}❌ MISSING:${NC} $PAGE"
        ((CRITICAL_ERRORS++))
    fi
done

echo -e "\n----------------------------------------------------------------"
echo -e "Structure checks complete: ${GREEN}$PASSED_CHECKS Passed${NC}, ${YELLOW}$WARNINGS Warnings${NC}, ${RED}$CRITICAL_ERRORS Critical Errors${NC}."
echo -e "----------------------------------------------------------------\n"


# Step 2: HTTP Listening & Live Mock Serving Check (Requires Python 3)
echo -e "${BLUE}${BOLD}[STAGE 2] Simulating HTTP Server Routing & Local Request Listener...${NC}"
echo -e "----------------------------------------------------------------"

# Find an available port
PORT=9999
while lsof -i :$PORT >/dev/null 2>&1; do
    PORT=$((PORT + 1))
done

# Check if Python is available to launch a mock server
if command -v python3 &>/dev/null; then
    echo -e "Launching local development web server on port ${YELLOW}$PORT${NC} using ${CYAN}http.server${NC}..."
    
    # Start server in background from target dir
    cd "$TARGET_DIR" || exit 1
    python3 -m http.server $PORT &>/dev/null &
    SERVER_PID=$!
    
    # Give the server a second to spin up
    sleep 1.5
    
    # Verify the background server is actually running
    if kill -0 $SERVER_PID 2>/dev/null; then
        echo -e "${GREEN}Mock Server running successfully under PID $SERVER_PID.${NC}"
        echo -e "Initiating route availability checks (HTTP GET queries)...\n"
        
        # Test routing for each page
        for PAGE in "${REQUIRED_PAGES[@]}"; do
            URL="http://localhost:$PORT/$PAGE"
            STATUS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$URL")
            
            if [ "$STATUS_CODE" -eq 200 ]; then
                echo -e "  ${GREEN}✔ HTTP 200 (OK):${NC} -> $PAGE"
                ((PASSED_CHECKS++))
            else
                echo -e "  ${RED}❌ HTTP $STATUS_CODE (FAILED):${NC} -> $PAGE"
                ((CRITICAL_ERRORS++))
            fi
        done
        
        # Shutdown local mock server cleanly
        echo -e "\nTearing down local mock server (PID $SERVER_PID)..."
        kill $SERVER_PID
        wait $SERVER_PID 2>/dev/null
        echo -e "${GREEN}Server closed gracefully.${NC}"
    else
        echo -e "${RED}❌ ERROR: Failed to launch Python background server.${NC}"
        ((CRITICAL_ERRORS++))
    fi
else
    echo -e "${YELLOW}⚠ NOTICE: Python 3 not detected. Skipping live local mock server routing checks.${NC}"
    echo -e "          (Install Python to run simulated browser HTTP GET request loops locally)${NC}"
    ((WARNINGS++))
fi

echo -e "\n${BLUE}${BOLD}================================================================${NC}"
echo -e "${CYAN}${BOLD}                    VERIFICATION SUMMARY                        ${NC}"
echo -e "${BLUE}${BOLD}================================================================${NC}"
echo -e "Total Successful Checks Passed:  ${GREEN}${BOLD}$PASSED_CHECKS${NC}"
echo -e "Warnings / Improvements:         ${YELLOW}${BOLD}$WARNINGS${NC}"
echo -e "Critical Deploy-Blocker Errors:  ${RED}${BOLD}$CRITICAL_ERRORS${NC}"
echo -e "${BLUE}${BOLD}================================================================${NC}"

if [ "$CRITICAL_ERRORS" -gt 0 ]; then
    echo -e "${RED}${BOLD}🔴 DEPLOY BLOCKER: Your local build has $CRITICAL_ERRORS critical errors!${NC}"
    echo -e "${RED}Please resolve the errors highlighted above before pushing changes to staging/production.${NC}"
    exit 1
else
    echo -e "${GREEN}${BOLD}💚 ALL CLEAR: Build verified successfully!${NC}"
    echo -e "${GREEN}No critical security leaks or structural failures found. You are ready to push!${NC}"
    exit 0
fi
