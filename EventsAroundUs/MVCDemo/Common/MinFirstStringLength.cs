using System.ComponentModel.DataAnnotations;

namespace MVCDemo.Common
{
    public class MinFirstStringLength : ValidationAttribute
    {
        public MinFirstStringLength(int minLength, char separator)
        {
            MinLength = minLength;
            Separator = separator;
        }

        public int MinLength { get; }
        public char Separator { get; }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (string.IsNullOrEmpty(value?.ToString()))
                return ValidationResult.Success;

            var arrCurrTerm = value.ToString().Split(Separator);
            
            return arrCurrTerm[0].Length < MinLength 
                ? new ValidationResult(FormatErrorMessage(validationContext.DisplayName)) 
                : ValidationResult.Success;
        }
    }
}
