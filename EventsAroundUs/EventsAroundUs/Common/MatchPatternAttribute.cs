using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace MVCDemo.Common
{
    internal class MatchPatternAttribute : ValidationAttribute
    {
        public MatchPatternAttribute(params string[] strings)
        {
            Strings = strings;
        }

        private Collection<string> _strings;

        public string[] Strings
        {
            get
            {
                if (_strings == null)
                {
                    _strings = new Collection<string>();
                }

                return _strings.ToArray();
            }
            private set
            {
                _strings = new Collection<string>(value);
            }
        }

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null)
                return new ValidationResult(this.FormatErrorMessage(validationContext.DisplayName));
            
            var matchesPattern = Strings.ToList().Select(s => s.ToLower()).Any(value.ToString().ToLower().Contains);

            return !matchesPattern 
                ? new ValidationResult(FormatErrorMessage(validationContext.DisplayName)) 
                : ValidationResult.Success;
        }
    }
}
