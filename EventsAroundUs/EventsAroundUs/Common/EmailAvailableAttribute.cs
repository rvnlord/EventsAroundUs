using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using System.Web;
using MVCDemo.Controllers;
using MVCDemo.Models;
using static MVCDemo.Controllers.BaseController;

namespace MVCDemo.Common
{
    public class EmailAvailableAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            try
            {
                if (value == null) return new ValidationResult("[EmailAvailableAttribute] Wartość własciwości podanej jako parametr wynosi null");
                var db = new ProjectDbContext();
                var email = value as string;
                var authUser = User.GetAuthenticated();
                var IsEmailUsed = db.Users.Any(u => u.Id != authUser.Id && u.Email == email);

                return IsEmailUsed 
                    ? new ValidationResult(FormatErrorMessage(validationContext.DisplayName)) 
                    : ValidationResult.Success;
            }
            catch (Exception ex)
            {
                return new ValidationResult(ex.Message);
            }
        }
    }
}