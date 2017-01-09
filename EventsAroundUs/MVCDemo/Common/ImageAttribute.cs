using System;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.IO;
using System.Linq;
using MVCDemo.Models;

namespace MVCDemo.Common
{
    public class ImageAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null) return new ValidationResult("[ImageAttribute] Wartość własciwości podanej jako parametr wynosi null");

            var image = (Image) value;

            const int twoMb = 2 * 1024 * 1024;
            var ext = Path.GetExtension(image.ImagePath);
            var avalExts = new[] { ".jpg", ".png", ".gif", ".bmp" };

            if (image.ImageData.Length == 0 || image.ImageData.Length > twoMb || !avalExts.Contains(ext))
                return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));

            return ValidationResult.Success;
        }
    }
}
