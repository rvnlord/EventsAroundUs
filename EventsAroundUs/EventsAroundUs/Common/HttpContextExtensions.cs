using System.Web;

namespace MVCDemo.Common
{
    public static class HttpContextExtensions
    {
        public static string GetAbsoluteUrl(this HttpContextBase hc, string virtualUrl)
        {
            virtualUrl = virtualUrl.Trim();
            while (virtualUrl.StartsWithAny("~", "/"))
                virtualUrl = virtualUrl.Skip(1);

            var basePath = hc.Request.ApplicationPath;
            if (basePath.IsNullOrWhiteSpace())
                basePath = "/";

            return basePath + "/" + virtualUrl;
        }
    }
}