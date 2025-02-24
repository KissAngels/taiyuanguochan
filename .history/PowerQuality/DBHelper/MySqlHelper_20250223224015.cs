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
}
