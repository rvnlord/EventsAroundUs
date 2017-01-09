using System;
using System.Collections.ObjectModel;
using System.ComponentModel.DataAnnotations;
using System.Linq;

namespace MVCDemo.Common
{
    public class AtLeastOnePropertyAttribute : ValidationAttribute
    {
        public AtLeastOnePropertyAttribute(Type type, params string[] excludedProperties)
        {
            Type = type;
            ExcludedProperties = excludedProperties;
        }

        public Type Type { get; }
        public string[] ExcludedProperties
        {
            get
            {
                if (_excludedProperties == null)
                    _excludedProperties = new Collection<string>();

                return _excludedProperties.ToArray();
            }
            private set
            {
                _excludedProperties = new Collection<string>(value);
            }
        }

        private Collection<string> _excludedProperties;

        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            var props = value.GetType().GetProperties()
                .Where(p => p.PropertyType == Type && !ExcludedProperties.Contains(p.Name));
            
            return props.Any(property => (bool)property.GetValue(value, null)) ? 
                ValidationResult.Success : new ValidationResult(FormatErrorMessage(validationContext.DisplayName));
        }
    }
}
