using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.NetworkInformation;
using System.Net.Sockets;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using System.Web;
using Newtonsoft.Json;

namespace MVCDemo.Common
{
    public static class Extensions
    {
        public static bool IsNullOrWhiteSpace(this string str)
        {
            return string.IsNullOrWhiteSpace(str);
        }

        public static string Skip(this string str, int n)
        {
            return new string(str.AsEnumerable().Skip(n).ToArray());
        }

        public static bool StartsWithAny(this string str, params string[] strings)
        {
            return strings.Any(str.StartsWith);
        }

        public static IEnumerable<string> SplitInParts(this string s, int partLength)
        {
            if (s == null)
                throw new ArgumentNullException(nameof(s));
            if (partLength <= 0)
                throw new ArgumentException("Długość pojedynczej części musi być większa niż 0.", nameof(partLength));

            for (var i = 0; i < s.Length; i += partLength)
                yield return s.Substring(i, Math.Min(partLength, s.Length - i));
        }

        public static string RelativePath(this HttpServerUtility server, string path, HttpRequest context)
        {
            return path.Replace(context.ServerVariables["APPL_PHYSICAL_PATH"], "~/").Replace(@"\", "/");
        }

        public static async Task<string> CallApi(string url, NameValueCollection nvpairs = null)
        {
            using (var client = new HttpClient())
            {
                var query = HttpUtility.ParseQueryString(string.Empty);
                if (nvpairs == null)
                    nvpairs = new NameValueCollection();
                foreach (string v in nvpairs)
                    query.Add(v, nvpairs[v]);
                var uri = new UriBuilder(url) { Query = query.ToString() };
                var response = await client.GetAsync(uri.ToString());
                var result = await response.Content.ReadAsStringAsync();
                return result;
            }
        }

        public static string GetIpAddress()
        {
            return GetClientIpAddress(new HttpRequestWrapper(HttpContext.Current.Request));
        }

        public static string GetClientIpAddress(HttpRequestBase request)
        {
            try
            {
                var userHostAddress = request.UserHostAddress;

                // próba parsowania otrzymanego IP
                IPAddress.Parse(userHostAddress);
                if (userHostAddress == "::1")
                    return "127.0.0.1";

                var xForwardedFor = request.ServerVariables["X_FORWARDED_FOR"];

                if (string.IsNullOrEmpty(xForwardedFor))
                    return userHostAddress;

                // pobierz listę publicznych adresów ze zmiennej X_FORWARDED_FOR
                var publicForwardingIps = xForwardedFor.Split(',').Where(ip => !IsPrivateIpAddress(ip)).ToList();

                // Jeśli znalazłem jakiś adres to go zwracam, w przeciwnym razie zwracam UserHostAddress
                return publicForwardingIps.Any() ? publicForwardingIps.Last() : userHostAddress;
            }
            catch (Exception)
            {
                return "0.0.0.0";
            }
        }

        private static bool IsPrivateIpAddress(string ipAddress)
        {
            // http://en.wikipedia.org/wiki/Private_network
            // Adresy prywatne: 
            // 24-bitowy blok: 10.0.0.0 do 10.255.255.255
            // 20-bitowy blok: 172.16.0.0 do 172.31.255.255
            // 16-bitowy blok: 192.168.0.0 do 192.168.255.255
            // Adresy lokalne: 169.254.0.0 do 169.254.255.255 (http://en.wikipedia.org/wiki/Link-local_address)

            var ip = IPAddress.Parse(ipAddress);
            var octets = ip.GetAddressBytes();

            var is24BitBlock = octets[0] == 10;
            if (is24BitBlock) return true; 

            var is20BitBlock = octets[0] == 172 && octets[1] >= 16 && octets[1] <= 31;
            if (is20BitBlock) return true; 

            var is16BitBlock = octets[0] == 192 && octets[1] == 168;
            if (is16BitBlock) return true; 

            var isLinkLocalAddress = octets[0] == 169 && octets[1] == 254;
            return isLinkLocalAddress;
        }


        //public static IPAddress GetInternetIPAddress()
        //{
        //    try
        //    {
        //        string[] prefixes = { "169.", "192." };
        //        var adapters = (
        //            from adapter in NetworkInterface.GetAllNetworkInterfaces()
        //            where
        //            adapter.OperationalStatus == OperationalStatus.Up &&
        //            adapter.Supports(NetworkInterfaceComponent.IPv4) &&
        //            adapter.GetIPProperties().GatewayAddresses.Count > 0 &&
        //            adapter.GetIPProperties().GatewayAddresses[0].Address.ToString() != "0.0.0.0"
        //            select adapter).ToList();

        //        if (adapters.Count > 1)
        //            throw new ApplicationException(
        //                "Domyślny adres IPv4 nie może zostać określony, ponieważ istnieją dwa interfejsy z bramkami.");

        //        var localIPs = adapters.First().GetIPProperties().UnicastAddresses;
        //        var ip = (
        //            from localIP in localIPs
        //            where
        //            localIP.Address.AddressFamily == AddressFamily.InterNetwork &&
        //            !prefixes.Any(p => localIP.Address.ToString().StartsWith(p)) &&
        //            !IPAddress.IsLoopback(localIP.Address)
        //            select localIP.Address).FirstOrDefault();

        //        if (ip != null) return ip;
        //    }
        //    catch (Exception ex)
        //    {
        //    }

        //    try
        //    {
        //        var queries = new NameValueCollection { { "format", "json" } };

        //        var address = @"https://api.ipify.org/";
        //        var response = AsyncHelpers.RunSync(() =>
        //            CallApi(address, queries));
        //        var anonType = new { ip = "" };
        //        var json = JsonConvert.DeserializeAnonymousType(response, anonType);

        //        return IPAddress.Parse(json.ip);
        //    }
        //    catch (Exception ex)
        //    {
        //        return null;
        //    }
        //}

        public static long? ConvertIpToUint(string ip)
        {
            return !string.IsNullOrWhiteSpace(ip)
                ? BitConverter.ToUInt32(IPAddress.Parse(ip).GetAddressBytes().Reverse().ToArray(), 0)
                : (long?)null;
        }

        public static string ConvertIpToString(long? ip)
        {
            return ip != null
                ? new IPAddress(BitConverter.GetBytes((long)ip).Reverse().SkipWhile(b => b == 0).Take(4).ToArray()).ToString()
                : "Brak";
        }
    }
}
