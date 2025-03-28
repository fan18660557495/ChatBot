import rpa_login, pdf_download, ini_op
from playwright.sync_api import sync_playwright
from playwright._impl._api_types import Error


def run():
    dwbh = ini_op.getinivalue('basic_config', 'dwbh')[0]
    with sync_playwright() as playwright:
        llq = rpa_login.run(playwright, 'new_browser', 'now_context', 'now_page')
        timenow = pdf_download.run(llq, dwbh)


        return timenow




        