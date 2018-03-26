using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace MVCDemo.Models
{
    [Table("tblNotifications")]
    public class Notification
    {
        [Key]
        [Column(Order = 0)]
        public Guid FromUserId { get; set; }

        [Key]
        [Column(Order = 1)]
        public Guid ToUserId { get; set; }

        [Key]
        [Column(Order = 2)]
        public Guid MessageId { get; set; }

        public virtual Message Message { get; set; }

        public virtual User FromUser { get; set; }

        public virtual User ToUser { get; set; }
    }
}