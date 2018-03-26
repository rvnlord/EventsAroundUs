using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using MVCDemo.Common;
using static MVCDemo.Models.AutoMapperConfiguration;

namespace MVCDemo.Models
{
    public class UserToEditViewModel : UserUtilities
    {
        [DisplayName("Użytkownik")]
        public string UserName { get; set; }

        [DisplayName("Adres IP")]
        public override long? CurrentIp { get; set; }

        [DisplayName("Email")]
        [Required]
        [RegularExpression(@"^(?("")("".+?(?<!\\)""@)|(([0-9a-z~!$%^&*_=+]((\.(?!\.))|[-!#\$%&'\*\+/=\?\^`\{\}\|~\w])*)(?<=[0-9a-z~!$%^&*_=+])@))" + @"(?(\[)(\[(\d{1,3}\.){3}\d{1,3}\])|(([0-9a-z~!$%^&*_=+][-\w]*[0-9a-z~!$%^&*_=+]*\.)+[a-z0-9~!$%^&*_=+][\-a-z0-9~!$%^&*_=+]{0,22}[a-z0-9~!$%^&*_=+]))$", ErrorMessage = "To nie jest poprawny adres email")]
        [EmailAvailable(ErrorMessage = "Podany Email jest już w bazie danych")]
        public string Email { get; set; }

        [DisplayName("Awatar")]
        [Image(ErrorMessage = "Awatar jest niepoprawny")]
        public Image Avatar { get; set; }
    }
}