using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Threading.Tasks;
using System.Web;
using MVCDemo.Common;
using Newtonsoft.Json;
using System.Data.Entity;
using System.Device;
using System.Device.Location;

namespace MVCDemo.Models
{
    public class UserUtilities
    {
        public virtual long? CurrentIp { get; set; }

        public Location GetLocation()
        {
            //try
            //{
            //    var db = new ProjectDbContext();
            //    var ipBlock = db.IpBlocks.Include(b => b.Location)
            //        .Single(ipbl => ipbl.StartIpNum < CurrentIp && ipbl.EndIpNum > CurrentIp);
            //    return ipBlock.Location; //$"{location.Country}, {location.City} (Baza Danych)";
            //}
            //catch (Exception ex)
            //{
            //    Debug.Print(ex.Message);
            //}

            try
            {
                var ip = Common.Extensions.ConvertIpToString(CurrentIp);
                var response = AsyncHelpers.RunSync(() => 
                    Common.Extensions.CallApi($"http://ipinfo.io/{ip}/json"));
                var anonType = new
                {
                    ip = "8.8.8.8",
                    hostname = "google-public-dns-a.google.com",
                    city = "Mountain View",
                    region = "California",
                    country = "US",
                    loc = "37.3860,-122.0838",
                    org = "AS15169 Google Inc.",
                    postal = "94035"
                };
                var json = JsonConvert.DeserializeAnonymousType(response, anonType);
                double?[] coords = { null, null };
                if (json.loc != null)
                    coords = json.loc.Split(',').Select(Convert.ToDouble).Cast<double?>().ToArray();
                return new Location
                {
                    Country = json.country,
                    City = json.city,
                    Latitude = coords[0],
                    Longitude = coords[1]
                }; //$"{json.country}, {json.city} (API)";
            }
            catch (Exception ex)
            {
                Debug.Print(ex.Message);
                return null;
            }
        }

        public double? GetDistanceTo(User user)
        {
            var l1 = GetLocation();
            var l2 = user.GetLocation();
            if (l1 == null || l2 == null || l1.Latitude == null || l1.Longitude == null || l2.Latitude == null || l2.Longitude == null)
                return null;

            var sCoord = new GeoCoordinate((double) l1.Latitude, (double) l1.Longitude);
            var eCoord = new GeoCoordinate((double) l2.Latitude, (double) l2.Longitude);

            return sCoord.GetDistanceTo(eCoord) / 1000;
        }

        public string GetDistanceAsString(User user)
        {
            var distance = GetDistanceTo(user);
            return distance == null ? "- km" : $"{distance:0.00} km";
        }
    }
}