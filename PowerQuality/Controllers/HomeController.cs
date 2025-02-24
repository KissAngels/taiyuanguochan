using Microsoft.AspNetCore.Mvc;
using Mysqlx;
using MySqlX.XDevAPI.Relational;
using Newtonsoft.Json;
using PowerQuality.Models;
using System.Data;
using System.Text.Json;

namespace PowerQuality.Controllers
{
    public class HomeController : Controller
    {
        MySqlDBHelper dbHelper = new();
        public IActionResult Index()
        {
            return View();
        }

        /// <summary>
        /// 
        /// </summary>
        /// <returns></returns>
        public IActionResult Current()
        {
            return View();
        }

        public IActionResult Harmonics()
        {
            return View();
        }

        public IActionResult Incidentrecord()
        {
            return View();
        }

        public IActionResult Voltage()
        {
            return View();
        }

        /// <summary>
        /// 骤升骤降事件
        /// </summary>
        /// <returns></returns>
        public IActionResult SagsWell()
        {
            return View();
        }

        /// <summary>
        /// 瞬态事件事件
        /// </summary>
        /// <returns></returns>
        public IActionResult TranSient()
        {
            return View();
        }

        /// <summary>
        /// 波形数据
        /// </summary>
        /// <returns></returns>
        public IActionResult WaveForm()
        {
            return View();
        }

        /// <summary>
        /// 仪表日志
        /// </summary>
        /// <returns></returns>
        public IActionResult Event()
        {
            return View();
        }

        /// <summary>
        /// 基础数据-历史
        /// </summary>
        /// <returns></returns>
        public IActionResult Meterbase()
        {
            return View();
        }

        /// <summary>
        /// 基础数据-实时
        /// </summary>
        /// <returns></returns>
        public IActionResult MeterbaseDetail()
        {
            return View();
        }

        /// <summary>
        /// 闪变数据
        /// </summary>
        /// <returns></returns>
        public IActionResult Pstandplt()
        {
            return View();
        }

        /// <summary>
        /// 谐波数据
        /// </summary>
        /// <returns></returns>
        public IActionResult Meterhd()
        {
            return View();
        }

        /// <summary>
        /// 电度数据
        /// </summary>
        /// <returns></returns>
        public IActionResult Powerdegree()
        {
            return View();
        }

        /// <summary>
        /// 报警数据
        /// </summary>
        /// <returns></returns>
        public IActionResult Alarmlog()
        {
            return View();
        }


        /// <summary>
        /// 获取电表信息列表
        /// </summary>
        /// <returns></returns>
        public JsonResult GetMeterinfonetList()
        {
            string sql = "select MeterID as MeterId,MeterName as MeterName from meterinfonet where StationID=1 and `Enable`=1";
            DataTable dt = dbHelper.ExecuteQuery(sql);
            string jsonObject = JsonConvert.SerializeObject(dt);
            return Json(jsonObject);
        }

        /// <summary>
        /// 获取各种报警的个数
        /// </summary>
        /// <returns></returns>
        public JsonResult GetTypeCount(int meterId, DateTime startTime, DateTime endTime)
        {
            string sql = $"SELECT t.Types, COALESCE(COUNT(l.Types), 0) AS Count FROM(SELECT 21 AS Types UNION SELECT 22 AS Types UNION SELECT 23 AS Types UNION SELECT 24 AS Types) AS t LEFT JOIN 1014_pd_alarmlog l ON l.Types = t.Types ";
            //sql += $"AND l.MeterID = {meterId} AND l.StartTime >= '{startTime}' AND l.StartTime < '{endTime}' ";
            sql += $"GROUP BY t.Types";
            DataTable dt = dbHelper.ExecuteQuery(sql);
            string jsonObject = JsonConvert.SerializeObject(dt);
            return Json(jsonObject);
        }

        /// <summary>
        /// 根据设备和时间查询电压数值   
        /// </summary>
        /// <returns></returns>
        public JsonResult GetVoltageValue(int meterId, DateTime startTime, DateTime endTime)
        {
            startTime = DateTime.Now.AddDays(-3);
            endTime = DateTime.Now;
            string sql = $"select Va,Vb,Vc,RecTime from 1014_pd_meterbasedetail ";
            //sql += $"where MeterID={meterId} and RecTime>='{startTime}' and RecTime<'{endTime}'";
            DataTable dt = dbHelper.ExecuteQuery(sql);
            string jsonObject = JsonConvert.SerializeObject(dt);
            return Json(jsonObject);
        }

        /// <summary>
        /// 根据设备和时间查询报警记录 
        /// </summary>
        /// <returns></returns>
        public JsonResult GetAlarmLog(int meterId, DateTime startTime, DateTime endTime)
        {
            startTime = DateTime.Now.AddDays(-3);
            endTime = DateTime.Now;
            string sql = $"select ml.MeterID,mi.MeterName,ml.RecTime,ml.Contents,at.AlarmTypeName,ml.ConfirmTime,ml.Levels from 1014_pd_alarmlog ml INNER JOIN alarmtype at on ml.Types=at.AlarmTypeID INNER JOIN meterinfonet mi on ml.MeterID=mi.MeterID ";
            //sql += $"where MeterID={meterId} and RecTime>='{startTime}' and RecTime<'{endTime}'";
            DataTable dt = dbHelper.ExecuteQuery(sql);
            string jsonObject = JsonConvert.SerializeObject(dt);
            return Json(jsonObject);
        }

        /// <summary>
        /// 查询事件记录前后的波形数据
        /// </summary>
        /// <returns></returns>
        public JsonResult GetWaveformData(int meterId, DateTime RecTime, string type)
        {
            if (type == "电流越限") type = "电流";
            if (type == "频率越限") type = "频率";
            if (type == "骤升骤降") type = "电压";
            if (type == "波形畸变") type = "功率因数";
            string sql = type switch
            {
                "电压" => $"select Va,Vb,Vc,RecTime from 1014_pd_meterbasedetail",
                "电流" => $"select Ia,Ib,Ic,RecTime from 1014_pd_meterbasedetail",
                "功率因数" => $"select PFa,PFb,PFc,RecTime from 1014_pd_meterbasedetail",
                "功率" => $"select Pa,Pb,Pc,RecTime from 1014_pd_meterbasedetail",
                "无功功率" => $"select Qa,Qb,Qc,RecTime from 1014_pd_meterbasedetail",
                "视在功率" => $"select Sa,Sb,Sc,RecTime from 1014_pd_meterbasedetail",
                _ => $"select F,RecTime from 1014_pd_meterbasedetail",
            };
            sql += $" where MeterID={meterId} and RecTime>=DATE_SUB('{RecTime}', INTERVAL 10 MINUTE) and RecTime<=DATE_ADD('{RecTime}', INTERVAL 10 MINUTE);";
            DataTable dt = dbHelper.ExecuteQuery(sql);
            string jsonObject = JsonConvert.SerializeObject(dt);
            return Json(jsonObject);
        }

        /// <summary>
        /// 骤升骤降事件-数据 
        /// </summary>
        /// <returns></returns>
        public JsonResult GetData(int meterId, DateTime startTime, DateTime endTime, string tablename)
        {
            startTime = DateTime.Now.AddDays(-100);
            endTime = DateTime.Now;
            string sql = $"select * from 1014_pd_{tablename} ";
            if (tablename == "alarmlog")
            {
                sql = $"select Title,AlarmValue,Contents,at.AlarmTypeName,StartTime,ConfirmTime,CurrentStatus from 1014_pd_alarmlog al INNER JOIN alarmtype at on al.Types = at.AlarmTypeID  ";
                sql += $"where MeterID={meterId} and RecTime>='{startTime}' and RecTime<'{endTime}'";
            }
            else if (tablename == "meterhd")
            {
                sql = $"select RecTime，THDVa,THDVb,THDVc,THDIa,THDIb,THDIc,THDVaMax,THDVbMax,THDVcMax,THDIaMax,THDIbMax,THDIcMax,THDVaMin,THDVbMin,THDVcMin,THDIaMin,THDIbMin,THDIcMin from 1014_pd_{tablename} ";
                sql += $"where MeterID={meterId} and RecTime>='{startTime}' and RecTime<'{endTime}'";
            }
            else if (tablename == "waveform" || tablename == "event" || tablename == "pstandplt" || tablename == "powerdegree")
            {
                sql += $"where MeterID={meterId} and RecTime>='{startTime}' and RecTime<'{endTime}'";
            }
            else
            {
                sql += $"where MeterID={meterId} and StartTime>='{startTime}' and StartTime<'{endTime}'";
            }
            DataTable dt = dbHelper.ExecuteQuery(sql);
            string jsonObject = JsonConvert.SerializeObject(dt);
            return Json(jsonObject);
        }
    }
}
