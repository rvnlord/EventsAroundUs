using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Web;

namespace MVCDemo.Models
{
    [Table("tbllocations")]
    public sealed class Location
    {
        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2214:DoNotCallOverridableMethodsInConstructors")]
        public Location()
        {
            IpBlocks = new HashSet<IpBlock>();
        }

        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int Id { get; set; }

        [Column(TypeName = "char")]
        [StringLength(2)]
        public string Country { get; set; }

        [Column(TypeName = "text")]
        [StringLength(65535)]
        public string City { get; set; }

        public double? Latitude { get; set; }

        public double? Longitude { get; set; }

        [System.Diagnostics.CodeAnalysis.SuppressMessage("Microsoft.Usage", "CA2227:CollectionPropertiesShouldBeReadOnly")]
        public ICollection<IpBlock> IpBlocks { get; set; }

        public override string ToString()
        {
            if (string.IsNullOrWhiteSpace(Country) && string.IsNullOrWhiteSpace(City))
                return "Nie można określić";
            return $"{Country}, {City}";
        }
    }
}