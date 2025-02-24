using System;
using System.Data;

public class TestDatabase
{
    public static void TestDatabaseConnection()
    {
        Console.WriteLine("开始测试数据库连接...");
        var dbHelper = new MySqlDBHelper();

        if (dbHelper.TestConnection())
        {
            Console.WriteLine("数据库连接成功！\n");
            
            // 获取所有表名
            var tables = dbHelper.GetAllTables();
            Console.WriteLine($"数据库中共有 {tables.Count} 个表：");
            foreach (string tableName in tables)
            {
                Console.WriteLine($"\n表名：{tableName}");
                
                // 获取表的列信息
                DataTable columns = dbHelper.GetTableColumns(tableName);
                Console.WriteLine("列信息：");
                Console.WriteLine("----------------------------------------");
                Console.WriteLine("列名\t\t数据类型\t可空\t注释");
                Console.WriteLine("----------------------------------------");
                
                foreach (DataRow row in columns.Rows)
                {
                    string columnName = row["COLUMN_NAME"]?.ToString() ?? "";
                    string dataType = row["DATA_TYPE"]?.ToString() ?? "";
                    string isNullable = row["IS_NULLABLE"]?.ToString() ?? "";
                    string comment = row["COLUMN_COMMENT"]?.ToString() ?? "";
                    
                    Console.WriteLine($"{columnName,-16}{dataType,-12}{(isNullable == "YES" ? "是" : "否"),-8}{comment}");
                }
                Console.WriteLine("----------------------------------------\n");
            }
        }
        else
        {
            Console.WriteLine("数据库连接失败！请检查以下内容：");
            Console.WriteLine("1. MySQL服务是否已启动");
            Console.WriteLine("2. 数据库连接字符串是否正确：");
            Console.WriteLine("   - 服务器：localhost");
            Console.WriteLine("   - 数据库：metercenter");
            Console.WriteLine("   - 用户名：root");
            Console.WriteLine("   - 密码：beijing@123");
            Console.WriteLine("3. 防火墙是否允许MySQL连接（默认端口3306）");
        }
    }
}
