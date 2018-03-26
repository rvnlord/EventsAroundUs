using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace MVCDemo.Models
{
    [Table("tblMessages")]
    public class Message
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Message()
        {
            Notifications = new HashSet<Notification>();
        }

        public Guid Id { get; set; }

        [Column(TypeName = "text")]
        [StringLength(65535)]
        public string Title { get; set; }

        [StringLength(1073741823)]
        public string Content { get; set; }

        public DateTime? CreationTime { get; set; }

        public virtual ICollection<Notification> Notifications { get; set; }
    }
}