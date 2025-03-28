from flask import Blueprint, request, render_template
import duckdb


# 创建 Blueprint
database = Blueprint('database', __name__)

@database.route('/showtables')
def showtables():
    conn = duckdb.connect('rpadata.db')
    tables = conn.execute("SHOW TABLES").fetchall()
    conn.close()
    return render_template('dbsql.html', tables=tables)

@database.route('/table/<name>')
def table(name):
    conn = duckdb.connect('rpadata.db')
    create_view_sql = conn.execute(f"select sql from duckdb_views() where view_name = '{name}'").fetchone() if name.startswith('v_') else None
    columns = conn.execute(f"DESCRIBE {name}").fetchall()
    data = conn.execute(f"SELECT * FROM {name}").df()
    conn.close()
    return render_template('table.html', table_name=name, create_view_sql=create_view_sql, columns=columns, data=data)

@database.route('/query', methods=['GET', 'POST'])
def query():
    conn = duckdb.connect('rpadata.db')
    if request.method == 'POST':
        sql = request.form['sql']
        try:
            result = conn.execute(sql).df()
            return render_template('query.html', sql=sql, result=result, error=None)
        except Exception as e:
            return render_template('query.html', sql=sql, result=None, error=str(e))
    conn.close()
    return render_template('query.html', sql='', result=None, error=None)