using System;
using System.ComponentModel.DataAnnotations.Schema;

namespace MVCDemo.Models
{
    [Table("project.tblactivationrequests")]
    public class ActivationRequest
    {
        public Guid Id { get; set; }

        public Guid? UserId { get; set; }

        public DateTime? ActivationRequestDateTime { get; set; }

        public virtual User User { get; set; }
    }
}
