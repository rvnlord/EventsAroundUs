using System;
using System.Collections.Generic;
using System.Web;
using System.Reflection;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Threading;
using System.Threading.Tasks;

namespace MVCDemo.Common
{
    public static class GlobalHelper
    {
        private const int TimedOutExceptionCode = -2147467259;
        public static bool IsMaxRequestExceededException(Exception e)
        {
            Exception main;
            var unhandled = e as HttpUnhandledException;

            if (unhandled != null && unhandled.ErrorCode == TimedOutExceptionCode)
                main = unhandled.InnerException;
            else
                main = e;
            
            var http = main as HttpException;

            if (http == null || http.ErrorCode != TimedOutExceptionCode)
                return false;
            // Nie istnieje metoda identyfikacji błędu RequestExceeded ponieważ jest on traktowany jako Timeout
            return http.StackTrace.Contains("GetEntireRawContent");
        }
    }

    public static class DisplayNameHelper
    {
        public static string GetDisplayName(object obj, string propertyName)
        {
            return obj == null ? null : GetDisplayName(obj.GetType(), propertyName);
        }

        public static string GetDisplayName(Type type, string propertyName)
        {
            var property = type.GetProperty(propertyName);
            return property == null ? null : GetDisplayName(property);
        }

        public static string GetDisplayName(PropertyInfo property)
        {
            var attrName = GetAttributeDisplayName(property);
            if (!string.IsNullOrEmpty(attrName))
                return attrName;

            var metaName = GetMetaDisplayName(property);
            return !string.IsNullOrEmpty(metaName) ? metaName : property.Name;
        }

        private static string GetAttributeDisplayName(PropertyInfo property)
        {
            var atts = property.GetCustomAttributes(typeof(DisplayNameAttribute), true);
            if (atts.Length == 0)
                return null;
            var displayNameAttribute = atts[0] as DisplayNameAttribute;
            return displayNameAttribute?.DisplayName;
        }

        private static string GetMetaDisplayName(PropertyInfo property)
        {
            if (property.DeclaringType == null)
                return null;
            var atts = property.DeclaringType.GetCustomAttributes(typeof(MetadataTypeAttribute), true);
            if (atts.Length == 0)
                return null;
            var metaAttr = atts[0] as MetadataTypeAttribute;
            var metaProperty = metaAttr?.MetadataClassType.GetProperty(property.Name);
            return metaProperty == null ? null : GetAttributeDisplayName(metaProperty);
        }
    }

    public static class AsyncHelpers
    {
        /// <summary>
        /// Execute's an async Task<T> method which has a void return value synchronously
        /// </summary>
        /// <param name="task">Task<T> method to execute</param>
        public static void RunSync(Func<Task> task)
        {
            var oldContext = SynchronizationContext.Current;
            var synch = new ExclusiveSynchronizationContext();
            SynchronizationContext.SetSynchronizationContext(synch);
            synch.Post(async _ =>
            {
                try
                {
                    await task();
                }
                catch (Exception e)
                {
                    synch.InnerException = e;
                    throw;
                }
                finally
                {
                    synch.EndMessageLoop();
                }
            }, null);
            synch.BeginMessageLoop();

            SynchronizationContext.SetSynchronizationContext(oldContext);
        }

        /// <summary>
        /// Execute's an async Task<T> method which has a T return type synchronously
        /// </summary>
        /// <typeparam name="T">Return Type</typeparam>
        /// <param name="task">Task<T> method to execute</param>
        /// <returns></returns>
        public static T RunSync<T>(Func<Task<T>> task)
        {
            var oldContext = SynchronizationContext.Current;
            var synch = new ExclusiveSynchronizationContext();
            SynchronizationContext.SetSynchronizationContext(synch);
            T ret = default(T);
            synch.Post(async _ =>
            {
                try
                {
                    ret = await task();
                }
                catch (Exception e)
                {
                    synch.InnerException = e;
                    throw;
                }
                finally
                {
                    synch.EndMessageLoop();
                }
            }, null);
            synch.BeginMessageLoop();
            SynchronizationContext.SetSynchronizationContext(oldContext);
            return ret;
        }

        private class ExclusiveSynchronizationContext : SynchronizationContext
        {
            private bool done;
            public Exception InnerException { get; set; }
            readonly AutoResetEvent workItemsWaiting = new AutoResetEvent(false);
            readonly Queue<Tuple<SendOrPostCallback, object>> items =
                new Queue<Tuple<SendOrPostCallback, object>>();

            public override void Send(SendOrPostCallback d, object state)
            {
                throw new NotSupportedException("We cannot send to our same thread");
            }

            public override void Post(SendOrPostCallback d, object state)
            {
                lock (items)
                {
                    items.Enqueue(Tuple.Create(d, state));
                }
                workItemsWaiting.Set();
            }

            public void EndMessageLoop()
            {
                Post(_ => done = true, null);
            }

            public void BeginMessageLoop()
            {
                while (!done)
                {
                    Tuple<SendOrPostCallback, object> task = null;
                    lock (items)
                    {
                        if (items.Count > 0)
                        {
                            task = items.Dequeue();
                        }
                    }
                    if (task != null)
                    {
                        task.Item1(task.Item2);
                        if (InnerException != null) // the method threw an exeption
                        {
                            throw new AggregateException("AsyncHelpers.Run method threw an exception.", InnerException);
                        }
                    }
                    else
                    {
                        workItemsWaiting.WaitOne();
                    }
                }
            }

            public override SynchronizationContext CreateCopy()
            {
                return this;
            }
        }
    }
}