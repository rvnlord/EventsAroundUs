using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.IO;

namespace MVCDemo.Models
{
    [Table("tblimages")]
    public class Image
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Image()
        {
            Users = new HashSet<User>();
        }

        public Guid Id { get; set; }

        [Column(TypeName = "blob")]
        public byte[] ImageData { get; set; }

        [StringLength(256)]
        public string ImagePath { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public virtual ICollection<User> Users { get; set; }

        [NotMapped]
        public string FullUrl => 
            $"data:Image/{Path.GetExtension(ImagePath)?.Replace(".", "")};" +
            $"base64,{Convert.ToBase64String(ImageData)}";
    }
}