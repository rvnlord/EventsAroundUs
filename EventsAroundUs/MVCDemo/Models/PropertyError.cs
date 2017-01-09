using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace MVCDemo.Models
{
    public class PropertyError
    {
        public string PropertyName { get; set; }
        public string Message { get; set; }

        public PropertyError(string propertyName, string message)
        {
            PropertyName = propertyName;
            Message = message;
        }
    }
}