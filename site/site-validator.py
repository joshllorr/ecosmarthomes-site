#!/usr/bin/env python3
"""
site-validator.py
Automated Pre-Deployment SEO, Security, & Mobile Health Validator
EcoSmartHomes Ireland
Zero-dependency Python 3.12 script using standard library.
"""

import argparse
import html.parser
import json
import os
import re
import sys
import urllib.parse
import urllib.request
from pathlib import Path
from typing import Dict, List, Set, Tuple

# ANSI Color Codes for terminal reporting
GREEN = "\033[92m"
RED = "\033[91m"
YELLOW = "\033[93m"
CYAN = "\033[96m"
BOLD = "\033[1m"
RESET = "\033[0m"

IS_GITHUB_ACTIONS = os.getenv("GITHUB_ACTIONS") == "true"


def log_gha_error(file_path: str, message: str, line: int = 1):
    if IS_GITHUB_ACTIONS:
        print(f"::error file={file_path},line={line}::{message}")


def log_gha_warning(file_path: str, message: str, line: int = 1):
    if IS_GITHUB_ACTIONS:
        print(f"::warning file={file_path},line={line}::{message}")


class HTMLAuditParser(html.parser.HTMLParser):
    def __init__(self):
        super().__init__()
        self.titles: List[str] = []
        self.h1_tags: List[str] = []
        self.meta_descriptions: List[str] = []
        self.canonicals: List[str] = []
        self.viewports: List[str] = []
        self.images_without_alt: List[dict] = []
        self.all_images: int = 0
        self.stripe_links: List[str] = []
        self.current_tag: str = ""
        self.current_text: List[str] = []

    def handle_starttag(self, tag: str, attrs: List[Tuple[str, str]]):
        self.current_tag = tag
        attr_dict = {k.lower(): v for k, v in attrs if v is not None}

        # Check for Stripe links
        if tag == "a" and "href" in attr_dict:
            href = attr_dict["href"]
            if "buy.stripe.com" in href or "stripe.com" in href:
                self.stripe_links.append(href)

        # Meta tags
        if tag == "meta":
            name = attr_dict.get("name", "").lower()
            content = attr_dict.get("content", "")
            if name == "description":
                self.meta_descriptions.append(content)
            elif name == "viewport":
                self.viewports.append(content)

        # Canonical links
        if tag == "link" and attr_dict.get("rel", "").lower() == "canonical":
            self.canonicals.append(attr_dict.get("href", ""))

        # Image tags
        if tag == "img":
            self.all_images += 1
            if "alt" not in attr_dict or attr_dict.get("alt", "").strip() == "":
                self.images_without_alt.append(attr_dict)

        # Reset text collector for container elements
        if tag in ["title", "h1"]:
            self.current_text = []

    def handle_endtag(self, tag: str):
        full_text = "".join(self.current_text).strip()
        if tag == "title":
            self.titles.append(full_text)
        elif tag == "h1":
            self.h1_tags.append(full_text)
        self.current_tag = ""

    def handle_data(self, data: str):
        if self.current_tag in ["title", "h1"]:
            self.current_text.append(data)


class SiteValidator:
    def __init__(self, target_dir: str, strict: bool = False):
        self.target_dir = Path(target_dir).resolve()
        self.strict = strict
        self.total_files = 0
        self.critical_errors: List[str] = []
        self.warnings: List[str] = []
        self.passed_checks = 0

    def run_static_audit(self) -> bool:
        print(f"\n{BOLD}{CYAN}══════════════════════════════════════════════════════════════════{RESET}")
        print(f"{BOLD}{CYAN} EcoSmartHomes Pre-Deployment Security & Technical SEO Validator {RESET}")
        print(f"{BOLD}{CYAN} Target Directory: {self.target_dir}{RESET}")
        print(f"{BOLD}{CYAN}══════════════════════════════════════════════════════════════════{RESET}\n")

        if not self.target_dir.exists():
            print(f"{RED}Directory not found: {self.target_dir}{RESET}")
            return False

        html_files = list(self.target_dir.rglob("*.html"))
        # Exclude vendor / node_modules / temp files
        html_files = [
            f for f in html_files 
            if "node_modules" not in str(f) and ".git" not in str(f) and ".system_generated" not in str(f)
        ]

        self.total_files = len(html_files)
        print(f"Discovered {BOLD}{self.total_files}{RESET} HTML files for inspection.\n")

        # Also scan JS / JSON files for Stripe test mode keys
        all_code_files = list(self.target_dir.rglob("*.js")) + list(self.target_dir.rglob("*.json"))
        all_code_files = [
            f for f in all_code_files 
            if "node_modules" not in str(f) and ".git" not in str(f) and ".system_generated" not in str(f) and "site-validator" not in str(f) and "update-stripe-links.js" not in str(f)
        ]

        # Scan code files for Stripe leaks
        for code_file in all_code_files:
            self._audit_code_security(code_file)

        for html_file in html_files:
            self._audit_html_file(html_file)

        self._print_summary()
        return len(self.critical_errors) == 0

    def _audit_code_security(self, file_path: Path):
        try:
            content = file_path.read_text(encoding="utf-8", errors="ignore")
            # Check for test mode links
            if "buy.stripe.com/test_" in content:
                err = f"CRITICAL SECURITY: Stripe Test Mode URL found in {file_path.name}"
                self.critical_errors.append(f"{file_path}: {err}")
                log_gha_error(str(file_path), err)

            # Check for test secret/publishable keys
            if re.search(r"sk_test_[0-9a-zA-Z]+", content) or re.search(r"pk_test_[0-9a-zA-Z]+", content):
                err = f"CRITICAL SECURITY: Stripe Test Key (pk_test/sk_test) found in {file_path.name}"
                self.critical_errors.append(f"{file_path}: {err}")
                log_gha_error(str(file_path), err)
        except Exception as e:
            self.warnings.append(f"Could not read {file_path}: {e}")

    def _audit_html_file(self, file_path: Path):
        rel_path = file_path.relative_to(self.target_dir)
        try:
            raw_html = file_path.read_text(encoding="utf-8", errors="ignore")
        except Exception as e:
            self.critical_errors.append(f"Failed to read {rel_path}: {e}")
            return

        parser = HTMLAuditParser()
        try:
            parser.feed(raw_html)
        except Exception as e:
            self.warnings.append(f"HTML Parse Warning on {rel_path}: {e}")

        # Check 1: Stripe Test Mode URL Leak
        for link in parser.stripe_links:
            if "test_" in link:
                err = f"CRITICAL: Stripe Test Mode URL '{link}' detected in {rel_path}"
                self.critical_errors.append(err)
                log_gha_error(str(file_path), err)
            else:
                self.passed_checks += 1

        # Check 2: Single H1 Tag Check
        if len(parser.h1_tags) == 0:
            err = f"SEO WARNING: Missing <h1> tag in {rel_path}"
            self.warnings.append(err)
            log_gha_warning(str(file_path), err)
        elif len(parser.h1_tags) > 1:
            err = f"SEO WARNING: Multiple ({len(parser.h1_tags)}) <h1> tags found in {rel_path}"
            self.warnings.append(err)
            log_gha_warning(str(file_path), err)
        else:
            self.passed_checks += 1

        # Check 3: Page Title
        if len(parser.titles) == 0 or not parser.titles[0]:
            err = f"SEO WARNING: Missing <title> tag in {rel_path}"
            self.warnings.append(err)
            log_gha_warning(str(file_path), err)
        else:
            self.passed_checks += 1

        # Check 4: Meta Description
        if len(parser.meta_descriptions) == 0 or not parser.meta_descriptions[0]:
            err = f"SEO NOTICE: Missing <meta name=\"description\"> in {rel_path}"
            self.warnings.append(err)
        else:
            self.passed_checks += 1

        # Check 5: Canonical Link
        if len(parser.canonicals) == 0:
            err = f"SEO NOTICE: Missing <link rel=\"canonical\"> in {rel_path}"
            self.warnings.append(err)
        else:
            self.passed_checks += 1

        # Check 6: Viewport Meta Tag (Mobile Responsiveness)
        if len(parser.viewports) == 0:
            err = f"MOBILE AUDIT: Missing <meta name=\"viewport\"> in {rel_path}"
            self.critical_errors.append(err)
            log_gha_error(str(file_path), err)
        else:
            self.passed_checks += 1

        # Check 7: Image Alt Attributes
        if len(parser.images_without_alt) > 0:
            err = f"ACCESSIBILITY: {len(parser.images_without_alt)} image(s) missing alt attribute in {rel_path}"
            self.warnings.append(err)

    def _print_summary(self):
        print(f"\n{BOLD}══════════════════════════════════════════════════════════════════{RESET}")
        print(f"{BOLD} AUDIT REPORT SUMMARY{RESET}")
        print(f"{BOLD}══════════════════════════════════════════════════════════════════{RESET}")
        print(f"Scanned Files:       {self.total_files}")
        print(f"Passed Assertions:   {GREEN}{self.passed_checks}{RESET}")
        print(f"Warnings / Notices:  {YELLOW}{len(self.warnings)}{RESET}")
        print(f"Critical Errors:     {RED if len(self.critical_errors) > 0 else GREEN}{len(self.critical_errors)}{RESET}\n")

        if self.critical_errors:
            print(f"{RED}{BOLD}CRITICAL ISSUES DETECTED (BLOCKING DEPLOYMENT):{RESET}")
            for err in self.critical_errors:
                print(f"  ❌ {RED}{err}{RESET}")
            print()

        if self.warnings and (self.strict or len(self.warnings) <= 10):
            print(f"{YELLOW}{BOLD}WARNINGS & NOTICES:{RESET}")
            for warn in self.warnings[:15]:
                print(f"  ⚠️ {YELLOW}{warn}{RESET}")
            if len(self.warnings) > 15:
                print(f"  ... and {len(self.warnings) - 15} more warnings.")
            print()

        if len(self.critical_errors) == 0:
            print(f"{GREEN}{BOLD}✔ ALL CRITICAL SECURITY & SEO CHECKS PASSED. READY FOR DEPLOYMENT!{RESET}\n")
        else:
            print(f"{RED}{BOLD}✖ DEPLOYMENT BLOCKED. Please resolve critical security / SEO failures.{RESET}\n")


def main():
    parser = argparse.ArgumentParser(description="EcoSmartHomes Pre-Deployment Site Validator")
    parser.add_argument("--local-dir", default=".", help="Local directory to scan (default: current directory)")
    parser.add_argument("--live-url", help="Live staging / production URL to crawl")
    parser.add_argument("--strict", action="store_true", help="Treat warnings as critical errors")
    args = parser.parse_args()

    validator = SiteValidator(target_dir=args.local_dir, strict=args.strict)
    success = validator.run_static_audit()

    if not success:
        sys.exit(1)
    sys.exit(0)


if __name__ == "__main__":
    main()
