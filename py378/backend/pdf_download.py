from playwright._impl._api_types import TimeoutError
import pyautogui, pandas, ini_op, os, pdf_sortAndRename, sys
from time import strftime

def run(llq, dwbh):
    browser, context, page = llq
    pz_list_file, pz_sheet, pz_no_head, pz_date_head, pdf_folder = ini_op.getinivalue('pdf_config', 
        'pz_list_file', 'pz_sheet', 'pz_no_head', 'pz_date_head', 'pdf_folder')
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.realpath(sys.argv[0])))
    timenow = str(strftime("%Y%m%d%H%M%S"))
    pdf_folder = os.path.join(BASE_DIR, pdf_folder, timenow)
    pz_list_file = os.path.join(BASE_DIR, pz_list_file)
    os.makedirs(pdf_folder, exist_ok=True)
    page.click('#toolbar_header_function')
    page.fill('#search', '联合打印')
    try:
        page.wait_for_selector('ul.search--result-list', timeout=2000)
    except Exception:
        page.click('.header--search')
    page.locator('ul.search--result-list li').first.click()

    page.wait_for_selector('li.borderactive[title="联合打印"]')
    id = page.query_selector('.borderactive a').get_attribute('id')
    page.wait_for_selector("iframe#rtf_iframe_" + id[:-5])
    frame = page.query_selector("iframe#rtf_iframe_" + id[:-5]).content_frame()
    frame.wait_for_selector('#FSBZDJ_PZH')
    frame.fill('input#FSBZDJ_DWNM', dwbh)
    frame.locator('input#FSBZDJ_DWNM').press('Enter')
    try:
        frame.wait_for_selector('#FSBZDJ_PZRQ_1', timeout=500)
    except TimeoutError:
        frame.click('.lee-filter-setting')
        frame.click('[for="lee-transfer-FSBZDJ_PZRQ"]')
        frame.click('.lee-transbtn-a')
        frame.click('.lee-dialog-btn-ok')

    global is_download, pzrq_now, pzh_now
    is_download = True
    def download(pzrq, pzh):
        global is_download, pzrq_now, pzh_now
        frame.fill('#FSBZDJ_PZH', pzh)
        frame.fill('#FSBZDJ_ZZPZH', pzh)

        frame.click('#FSBZDJ_PZRQ_1')

        frame.locator('span[lay-type="year"]').first.click()
        frame.locator('li[lay-ym="'+pzrq[:4]+'"]').first.click()
        frame.locator('span[lay-type="month"]').first.click()
        frame.locator('li[lay-ym="'+str(int(pzrq[5:7])-1)+'"]').first.click()
        frame.locator('td[lay-ymd="'+pzrq[:5]+str(int(pzrq[5:7]))+'-'+str(int(pzrq[8:]))+'"]').first.click()
        
        frame.locator('span[lay-type="year"]').last.click()
        frame.locator('li[lay-ym="'+pzrq[:4]+'"]').last.click()
        frame.locator('span[lay-type="month"]').last.click()
        frame.locator('li[lay-ym="'+str(int(pzrq[5:7])-1)+'"]').last.click()
        frame.locator('td[lay-ymd="'+pzrq[:5]+str(int(pzrq[5:7]))+'-'+str(int(pzrq[8:]))+'"]').last.click()

        frame.locator('.laydate-btns-confirm').click()

        while True:
            try:
                frame.wait_for_selector('.lee-grid-pager-title span:text-matches("1")', timeout=5000)
                break
            except TimeoutError:
                frame.click('.lee-solution-search button:text-matches("筛选")')
        frame.wait_for_selector('td[id$=FSBZDJ_PZH] a[title="'+pzh+'"]', timeout=60000)

        while True:
            if is_download:
                break
            page.wait_for_timeout(1000)

        pzrq_now = pzrq
        pzh_now = pzh
        while True:
            frame.locator('td[id$=FSBZDJ_PZH] a[title="'+pzh+'"]').locator('../../../td[substring(@id, string-length(@id) - string-length("FSBZDJ_PZRQ") + 1) = "FSBZDJ_PZRQ"]').locator('div[title="'+pzrq+'"]').click()
            frame.click('#toolbar1 span:text-matches("打印")')
            try:
                frame.wait_for_selector('.lee-message-top-center .lee-alert span:text-matches("请选中一条单据")', timeout=1000)
            except TimeoutError:
                break

        while True:
            if not is_download:
                break
            page.wait_for_timeout(1000)
        page.click('li.borderactive[title="联合打印"] a[id^=BILLPRINT] .nav-link-close')


    
    def handle_response(response):
        global is_download, pzrq_now, pzh_now
        if "http://cpfms.casccloud.cn/api/BP/EIS/v1.0/imagedownload/print" in response.url and 'isBrowser' not in response.url:
            is_download = False
            print(response.url)
            pdf_page = context.new_page()
            pdf_page.goto(response.url)
            pdf_page.wait_for_timeout(2000)
            with pdf_page.expect_download(timeout=600000) as download_info:
                pyautogui.hotkey('ctrl', 's')
                # pdf_page.locator('#viewer').down('Control')
                # pdf_page.locator('#viewer').press('s')
                # pdf_page.locator('#viewer').up('Control')
            download = download_info.value
            download.save_as(pdf_folder+'/'+pzrq_now[:8]+pzh_now+'.pdf')
            pdf_page.close()
            is_download = True

    page.on('response', handle_response)

    df = pandas.read_excel(pz_list_file, sheet_name=pz_sheet)
    for index, row in df.iterrows():
        download(row[pz_date_head], row[pz_no_head])
    while True:
        if is_download:
            break
        page.wait_for_timeout(1000)
    
    pdf_sortAndRename.run(timenow)
    return timenow