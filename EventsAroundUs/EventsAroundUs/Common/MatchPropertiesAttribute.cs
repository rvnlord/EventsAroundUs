using System;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Reflection;

namespace MVCDemo.Common
{
    class MatchPropertiesAttribute : ValidationAttribute
    {
        public MatchPropertiesAttribute(Type type, params string[] defaultValues)
        {
            Type = type;
            DefaultValues = defaultValues;
        }

        public Type Type { get; }
        public string[] DefaultValues
        {
            get
            {
                if (_defaultValues == null)
                {
                    _defaultValues = new Collection<string>();
                }

                return _defaultValues.ToArray();
            }
            private set
            {
                _defaultValues = new Collection<string>(value);
            }
        }

        private Collection<string> _defaultValues;

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null)
                return new ValidationResult(FormatErrorMessage(validationContext.DisplayName));

            var properties = Type.GetProperties(BindingFlags.Public | BindingFlags.NonPublic | BindingFlags.Instance | BindingFlags.DeclaredOnly);
            var propertiesNames = properties.Select(p => p.Name.ToLower()).ToList();

            if (DefaultValues != null)
                propertiesNames.AddRange(DefaultValues);

            var isPropertyOrDefault = propertiesNames.Any(value.ToString().ToLower().Contains);

            return isPropertyOrDefault 
                ? ValidationResult.Success 
                : new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
        }
    }
}
