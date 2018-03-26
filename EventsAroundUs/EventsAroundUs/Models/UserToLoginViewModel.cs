using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using MVCDemo.Common;
using MVCDemo.Controllers;
using Newtonsoft.Json;
using static MVCDemo.Models.AutoMapperConfiguration;

namespace MVCDemo.Models
{
    public class UserToLoginViewModel
    { // nie trzeba walidacji bo ModelState przy logowaniu nie jest sprawdzany
        public Guid Id { get; set; }

        [DisplayName("Użytkownik")]
        public string UserName { get; set; }
        
        [DisplayName("Hasło")]
        public string Password { get; set; }

        [DisplayName("Zapamiętaj")]
        public bool RememberMe { get; set; }

        public static UserToLoginViewModel GetAuthenticated()
        {
            var userCookie = HttpContext.Current.Request.Cookies["LoggedUser"];
            var userSession = (UserToLoginViewModel)HttpContext.Current.Session["LoggedUser"];
            var user = new User();
            UserToLoginViewModel userToLogin = null;
            if (userSession != null)
                userToLogin = userSession;
            else if (userCookie != null)
                userToLogin = JsonConvert.DeserializeObject<UserToLoginViewModel>(userCookie.Value);

            Mapper.Map(userToLogin, user);
            return user.Authenticate(true) == ActionStatus.Success
                ? userToLogin
                : null;
        }
    }
}
