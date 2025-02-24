using MySql.Data.MySqlClient;
using System.Data;
using System.Collections.Generic;

public class MySqlDBHelper
{
    private string connectionString;

    // 构造函数
    public MySqlDBHelper()
    {
        // 连接字符串
        string server = "localhost";
        string database = "metercenter";
        string username = "root";
        string password = "beijing@123";
        connectionString = $"Server={server};Database={database};User ID={username};Password={password};";
    }

    // 执行查询 (返回单个结果)
    public object ExecuteScalar(string query)
    {
        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            MySqlCommand cmd = new MySqlCommand(query, connection);
            return cmd.ExecuteScalar();
        }
    }

    // 执行查询 (返回 DataTable)
    public DataTable ExecuteQuery(string query)
    {
        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            MySqlDataAdapter adapter = new MySqlDataAdapter(query, connection);
            DataTable dt = new DataTable();
            adapter.Fill(dt);
            return dt;
        }
    }

    // 执行更新、插入或删除 (返回受影响的行数)
    public int ExecuteNonQuery(string query)
    {
        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            MySqlCommand cmd = new MySqlCommand(query, connection);
            return cmd.ExecuteNonQuery();
        }
    }

    // 执行带参数的查询
    public DataTable ExecuteQueryWithParams(string query, Dictionary<string, object> parameters)
    {
        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            MySqlCommand cmd = new MySqlCommand(query, connection);

            foreach (var param in parameters)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);
            }

            MySqlDataAdapter adapter = new MySqlDataAdapter(cmd);
            DataTable dt = new DataTable();
            adapter.Fill(dt);
            return dt;
        }
    }

    // 执行带参数的更新、插入或删除
    public int ExecuteNonQueryWithParams(string query, Dictionary<string, object> parameters)
    {
        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            MySqlCommand cmd = new MySqlCommand(query, connection);

            foreach (var param in parameters)
            {
                cmd.Parameters.AddWithValue(param.Key, param.Value);
            }

            return cmd.ExecuteNonQuery();
        }
    }

    // 测试数据库连接
    public bool TestConnection()
    {
        try
        {
            using (var connection = new MySqlConnection(connectionString))
            {
                connection.Open();
                return true;
            }
        }
        catch (Exception)
        {
            return false;
        }
    }

    // 获取数据库中所有表名
    public List<string> GetAllTables()
    {
        List<string> tables = new List<string>();
        string query = @"SELECT TABLE_NAME 
                        FROM INFORMATION_SCHEMA.TABLES 
                        WHERE TABLE_SCHEMA = @dbName";

        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            using (MySqlCommand cmd = new MySqlCommand(query, connection))
            {
                cmd.Parameters.AddWithValue("@dbName", "metercenter");
                using (MySqlDataReader reader = cmd.ExecuteReader())
                {
                    while (reader.Read())
                    {
                        tables.Add(reader.GetString(0));
                    }
                }
            }
        }
        return tables;
    }

    // 获取表的所有列信息
    public DataTable GetTableColumns(string tableName)
    {
        string query = @"SELECT COLUMN_NAME, DATA_TYPE, CHARACTER_MAXIMUM_LENGTH, 
                               IS_NULLABLE, COLUMN_DEFAULT, COLUMN_COMMENT
                        FROM INFORMATION_SCHEMA.COLUMNS 
                        WHERE TABLE_SCHEMA = @dbName 
                        AND TABLE_NAME = @tableName";

        using (var connection = new MySqlConnection(connectionString))
        {
            connection.Open();
            using (MySqlCommand cmd = new MySqlCommand(query, connection))
            {
                cmd.Parameters.AddWithValue("@dbName", "metercenter");
                cmd.Parameters.AddWithValue("@tableName", tableName);
                
                DataTable dt = new DataTable();
                using (MySqlDataAdapter adapter = new MySqlDataAdapter(cmd))
                {
                    adapter.Fill(dt);
                }
                return dt;
            }
        }
    }
}
