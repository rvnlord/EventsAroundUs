using System.Web.Mvc;
using MVCDemo.Models;

namespace MVCDemo.Controllers
{
    public class HomeController : BaseController
    {
        public ActionResult Index()
        {
            return View();
        }
    }
}