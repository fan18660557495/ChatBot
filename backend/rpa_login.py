# -*- coding: utf-8 -*-
import pyautogui, ini_op, os, sys

def run(playwright, browserMethod, contextMethod, pageMethod):
    chrome_port, login_way, net, url, username, password, is_zsxz = ini_op.getinivalue('basic_config', 'chrome_port', 'login_way', 'smw_net', 'nw_net', 'gscloud_username', 'gscloud_password', 'is_zsxz')
    if login_way == '账号密码登录':
        if browserMethod == 'new_browser':
            BASE_DIR = os.path.dirname(os.path.realpath(sys.argv[0]))
            browser_path = os.path.join(BASE_DIR, 'Browser Data')
            os.makedirs(browser_path, exist_ok=True)
            browser = playwright.chromium.launch(headless=False, slow_mo=50, args=['--start-maximized'])
            context = browser.new_context(ignore_https_errors=True, accept_downloads=True, no_viewport=True)
            page = context.new_page()
        else:
            browser = playwright.chromium.connect_over_cdp('http://localhost:'+chrome_port)
            if contextMethod == 'new_context':
                context = browser.new_context(ignore_https_errors=True, accept_downloads=True, no_viewport=True)
                page = context.new_page()
            else:
                context = browser.contexts[0]
                if pageMethod == 'new_page':
                    page = context.new_page()
                else:
                    page = context.pages[0]
        page.goto(net)
        page.fill('#userName', username)
        page.fill('#passWord', password)
        page.locator('#login').first.click()
        page.wait_for_selector('#toolbar_header_function', timeout=600000)
        return [browser, context, page]
    elif login_way == 'CA登录':
        if browserMethod == 'new_browser':
            BASE_DIR = os.path.dirname(os.path.realpath(sys.argv[0]))
            browser_path = os.path.join(BASE_DIR, 'Browser Data')
            os.makedirs(browser_path, exist_ok=True)
            browser = playwright.chromium.launch(headless=False, slow_mo=50, args=['--start-maximized'])
            context = browser.new_context(ignore_https_errors=True, accept_downloads=True, no_viewport=True)
            page = context.new_page()
        else:
            browser = playwright.chromium.connect_over_cdp('http://localhost:'+chrome_port)
            if contextMethod == 'new_context':
                context = browser.new_context(ignore_https_errors=True, accept_downloads=True, no_viewport=True)
                page = context.new_page()
            else:
                context = browser.contexts[0]
                if pageMethod == 'new_page':
                    page = context.new_page()
                else:
                    page = context.pages[0]
        page.goto(url)
        if is_zsxz == '是':
            for i in range(15):
                try:
                    page.wait_for_selector('#toolbar_header_function', timeout=2000)
                except Exception:
                    pyautogui.press('Enter')
        else:
            page.wait_for_selector('#toolbar_header_function', timeout=600000)

        return [browser, context, page]



