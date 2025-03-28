from playwright.sync_api import sync_playwright
from flask import Flask, request, render_template, Response, jsonify, send_from_directory
from flask_cors import CORS
import threading, socket, os, sys, subprocess, ini_op, time, rpa_login, duckdb, rpa_run
from time import strftime

from databaseRequest import database


app = Flask(__name__, static_folder='static', template_folder='templates')
# 允许跨域传输数据
CORS(app)
# app.debug = True

# 注册 Blueprint
app.register_blueprint(database, url_prefix='/database')

BASE_DIR = os.path.dirname(os.path.realpath(sys.argv[0]))

# 处理 React 前端路由（所有其他路由返回 React 应用）
@app.route('/', defaults={'path': ''})
@app.route('/<path:path>')
def serve_react_app(path):
    if path != "" and os.path.exists(os.path.join(app.static_folder, path)):
        return send_from_directory(app.static_folder, path)
    else:
        return send_from_directory(app.template_folder, 'calc.html')

@app.route('/rpa/pdfDownload/run')
def run():
    timenow = rpa_run.run()
    output_folder = ini_op.getinivalue('pdf_config', 'output_folder')[0]
    pdfFilesPath = os.path.join(os.path.dirname(BASE_DIR), output_folder, timenow)
    return jsonify({"code":200, "filePath":pdfFilesPath}), 200

# 浏览器启动函数
#若已启动则取消再次运行
def check_port_in_use(port):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('127.0.0.1', port)) != 0
def open_browser1(app_port, chrome_port, browser_path):
    browser_path = os.path.join(BASE_DIR, browser_path)
    url = 'http://127.0.0.1:'+app_port
    command = [
        browser_path,
        f'--remote-debugging-port={chrome_port}',
        '--start-maximized',
        url,
    ]
    browser_process = subprocess.Popen(command)
    # 监控浏览器进程
    while True:
        # 检查进程是否仍在运行
        retcode = browser_process.poll()
        if retcode is not None:
            # 如果进程已结束，调用 os._exit(0) 终止程序
            os._exit(0)
        time.sleep(1)

def open_browser2(app_port, chrome_port):
    with sync_playwright() as p:
        # 设置启动参数
        args = [
            '--start-maximized',
            f'--remote-debugging-port={chrome_port}'
        ]
        browser_path = os.path.join(BASE_DIR, 'Browser Data')
        os.makedirs(browser_path, exist_ok=True)
        browser = p.chromium.launch_persistent_context(browser_path, headless=False, ignore_https_errors=True, accept_downloads=True, slow_mo=50, no_viewport=True, args=args)
        try:
            page = browser.pages[0]
        except Exception:
            page = browser.new_page()
        try:
            page.goto('http://127.0.0.1:'+app_port)
        except Exception:
            pass
        try:
            page.wait_for_selector('#cjdshsjkskfsk', timeout=300000000)
        except Exception:
            browser.close()
        finally:
            os._exit(0)


if __name__ == '__main__':
    app_port, chrome_port, browser_select, browser_path = ini_op.getinivalue('basic_config', 'app_port', 'chrome_port', 'browser_select', 'browser_path')
    # 仅在主进程中启动浏览器线程
    # if check_port_in_use(int(app_port)):
    #     if browser_select == '1':
    #         browser_thread = threading.Thread(target=open_browser1, args=[app_port, chrome_port, browser_path])
    #     else:
    #         browser_thread = threading.Thread(target=open_browser2, args=[app_port, chrome_port])
    #     browser_thread.start()
    app.run(host='0.0.0.0',port=app_port, debug=True)