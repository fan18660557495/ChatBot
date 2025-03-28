import os, fitz, re, ini_op, sys 


def sortAndRename(pdf_path, output_folder, ht_key, pz_key, pzrq_method, pzh_method, keep_ht, hb_doc):
    doc = fitz.open()
    new_doc = fitz.open(pdf_path)
    ht_pages = []
    pz_pages = []
    other_pages = []
    date_value = '未找到凭证页'
    voucher_value = '未找到凭证页'

    is_ht_page = False
    is_pz_page = False
    # 遍历PDF每一页，寻找包含关键词的页
    for i in range(len(new_doc)):
        text = new_doc[i].get_text("text")
        if ht_key in text:
            is_ht_page = True
        # 处理凭证页
        if pz_key in text:
            is_ht_page = False
            is_pz_page = True
            pz_pages.append(i)
            # 正则匹配日期与凭证号
            date_pattern = pzrq_method
            voucher_pattern = pzh_method

            # 提取匹配的内容
            date_match = re.search(date_pattern, text)
            voucher_match = re.search(voucher_pattern, text)

            # 获取匹配的值
            date_value = date_match.group(1) if date_match else "未找到日期"
            voucher_value = voucher_match.group(1) if voucher_match else "未找到凭证号"
        elif is_ht_page:
            ht_pages.append(i)
        elif is_pz_page:
            pz_pages.append(i)
        else:
            other_pages.append(i)
    # 重新排列页面
    if keep_ht:
        all_pages = pz_pages + ht_pages + other_pages
    else:
        all_pages = pz_pages + other_pages
    for page_idx in all_pages:
        doc.insert_pdf(new_doc, from_page=page_idx, to_page=page_idx)
        hb_doc.insert_pdf(new_doc, from_page=page_idx, to_page=page_idx)
    #保存新pdf
    if date_value == '未找到凭证页':
        output_path = os.path.join(output_folder, f"{os.path.basename(pdf_path)[:-4]}('未找到凭证页').pdf")
    else:
        output_path = os.path.join(output_folder, f"{date_value[:4]}-{date_value[4:6]}-{voucher_value}.pdf")
    doc.save(output_path)
    new_doc.close()
    doc.close()
    print(f"处理完成，新的PDF已保存至 {output_path}")
    return hb_doc

def run(timenow):
    pdf_folder, output_folder, ht_key, pz_key, pzrq_method, pzh_method, keep_ht = ini_op.getinivalue("pdf_config", 
        "pdf_folder", "output_folder", "ht_key", "pz_key", "pzrq_method", "pzh_method", "keep_ht")
    BASE_DIR = os.path.dirname(os.path.dirname(os.path.realpath(sys.argv[0])))
    pdf_folder = os.path.join(BASE_DIR, pdf_folder, timenow)
    output_folder = os.path.join(BASE_DIR, output_folder, timenow)
    os.makedirs(pdf_folder, exist_ok=True)
    os.makedirs(output_folder, exist_ok=True)
    keep_ht = keep_ht == 'True'
    # 遍历PDF文件夹
    file_list = os.listdir(pdf_folder)
    hb_doc = fitz.open()
    for file in file_list:
        if file.endswith(".pdf"):
            pdf_path = os.path.join(pdf_folder, file)
            hb_doc = sortAndRename(pdf_path, output_folder, ht_key, pz_key, pzrq_method, pzh_method, keep_ht, hb_doc)
    hb_doc.save(os.path.join(output_folder, "联合打印.pdf"))
    # print(f"处理完成，合并PDF已保存至 {os.path.join(output_folder, "联合打印.pdf")}")

if __name__ == "__main__":
    timenow = '20250317174820'
    run(timenow)






