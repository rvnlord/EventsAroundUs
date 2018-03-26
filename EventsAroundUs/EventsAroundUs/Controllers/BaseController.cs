using System;
using System.Activities.Validation;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Data;
using System.Data.Entity;
using System.Data.Entity.Infrastructure;
using System.Linq;
using System.Web.Mvc;
using MVCDemo.Models;
using System.IO;
using Newtonsoft.Json;
using System.Threading;
using System.Web;
using System.Xml.Linq;
using MySql.Data.MySqlClient;
using static MVCDemo.Models.AutoMapperConfiguration;

namespace MVCDemo.Controllers
{
    public class BaseController : Controller
    {
        #region === WŁAŚCIWOŚCI ===

        protected static ActionStatus Status { get; set; }

        #endregion

        #region === OGÓLNE ===

        /// <summary>
        /// Renderuje Widok Częściowy do stringa zawierającego kod Html do wyświetlenia w przeglądarce.
        /// </summary>
        /// <param name="partialViewName">Nazwa Widoku Częściowego do wyświetlenia</param>
        /// <param name="model">Model związany z Widokiem Częściowym</param>
        /// <returns>Kod Html renderowany jako Widok Częsciowy</returns>
        public virtual string RenderPartialView(string partialViewName, object model)
        {
            if (ControllerContext == null)
                return string.Empty;

            if (model == null)
                throw new ArgumentNullException(nameof(model));

            if (string.IsNullOrEmpty(partialViewName))
                throw new ArgumentNullException(nameof(partialViewName));

            ModelState.Clear();//Remove possible model binding error.

            ViewData.Model = model;//Set the model to the partial view

            using (var sw = new StringWriter())
            {
                var viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, partialViewName);
                var viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);
                viewResult.View.Render(viewContext, sw);
                return sw.GetStringBuilder().ToString();
            }
        }

        #endregion

        #region === PANEL LOGOWANIA ===

        public string GetLoginPanel(string controller, string action)
        {
            //Thread.Sleep(5000);
            var userToLogin = GetAuthenticatedUser();
            return JsonConvert.SerializeObject(new
            {
                PartialView = userToLogin != null
                    ? RenderPartialView("_LoginPanelLogged", userToLogin)
                    : RenderPartialView("_LoginPanel", new UserToLoginViewModel())
            });
        }

        public string LoginUser([Bind(Include = "UserName,Password,RememberMe")] UserToLoginViewModel userToLogin)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");
            //Thread.Sleep(5000);

            var user = new User();
            Mapper.Map(userToLogin, user);

            var isAuthenticated = user.Authenticate();
            Mapper.Map(user, userToLogin);

            switch (isAuthenticated)
            {
                case ActionStatus.Success:
                {
                    userToLogin.Id = user.Id;

                    // Zapisz w Sesji
                    Session["LoggedUser"] = userToLogin;
                    
                    // Zapisz w Cookies
                    if (user.RememberMe)
                    {
                        Response.SetCookie(new HttpCookie("LoggedUser")
                        {
                            Value = JsonConvert.SerializeObject(userToLogin),
                            Expires = DateTime.Now.AddDays(30)
                        });
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "",
                        PartialView = RenderPartialView("_LoginPanelLogged", userToLogin)
                    });
                }
                case ActionStatus.Failure:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = $"Niepoprawne Dane. Prób: {4 - user.RetryAttempts}",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.UserDoesNotExist:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "Użytkownik nie istnieje",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.AccountNotActivated:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "Konto Nieaktywne",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.AccountLocked:
                {
                    int? secondsToUnlock = null;
                    if (user.LockedDateTime != null)
                        secondsToUnlock = (int) (15 * 60 - DateTime.Now.Subtract((DateTime) user.LockedDateTime).TotalSeconds);
                    if (secondsToUnlock < 0)
                        secondsToUnlock = 0;

                    var timeToUnlock = secondsToUnlock != null
                        ? $"{secondsToUnlock / 60:00}" + ":" + $"{secondsToUnlock % 60:00}" // string.Format("{0:00}", secondsToUnlock % 60) 
                        : "błąd";

                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = $"Zablokowano. Spróbuj za: {timeToUnlock}",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                case ActionStatus.DatabaseError:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        LoginMessage = "Baza Danych nie odpowiada",
                        PartialView = RenderPartialView("_LoginPanel", userToLogin)
                    });
                }
                default:
                    throw new ArgumentOutOfRangeException();
            }

        }

        public string Logout()
        {
            //Thread.Sleep(5000);
            // Usuń Sesję
            Session.Remove("LoggedUser");

            // Usuń Cookie
            if (Request.Cookies["LoggedUser"] != null)
            {
                Response.SetCookie(new HttpCookie("LoggedUser")
                {
                    Expires = DateTime.Now.AddDays(-1),
                    Value = null
                });
            }

            return JsonConvert.SerializeObject(new
            {
                PartialView = RenderPartialView("_LoginPanel", new UserToLoginViewModel())
            }); 
        }

        public UserToLoginViewModel GetAuthenticatedUser()
        {
            var userCookie = Request.Cookies["LoggedUser"];
            var userSession = (UserToLoginViewModel)Session["LoggedUser"];
            var user = new User();
            UserToLoginViewModel userToLogin = null;
            if (userSession != null)
                userToLogin = userSession;
            else if (userCookie != null)
                userToLogin = JsonConvert.DeserializeObject<UserToLoginViewModel>(userCookie.Value);

            Mapper.Map(userToLogin, user);
            return user.Authenticate(true) == ActionStatus.Success 
                ? userToLogin 
                : null;
        }

        #endregion

        #region === PANEL WYSZUKIWANIA ===

        public string GetSearchPanel(Search search = null)
        {
            //Thread.Sleep(5000);
            if (!Request.IsAjaxRequest()) throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            return JsonConvert.SerializeObject(new
            {
                PartialView = GetAuthenticatedUser() != null 
                    ? RenderPartialView("_SearchPanel", search ?? new Search())
                    : string.Empty
            });
        }

        #endregion

        #region === PANEL ZNAJOMYCH ===

        public string GetFriendsPanel(Search search)
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var authUser = CheckIfLogged();
                CheckModelValidation();

                var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Include(u => u.AddedAsFriendBy)
                    .Single(u => u.Id == authUser.Id);

                var partialFriendsIds = dbLoggedUser.AddedToFriends.Select(u => u.Id)
                    .Concat(dbLoggedUser.AddedAsFriendBy.Select(u => u.Id)).Distinct().ToArray();

                var searchTerm = search.SearchTerm;

                var queryNotYetPartialFriends = db.Users
                    .Where(u => partialFriendsIds.All(pfid => pfid != u.Id))
                    .Where(u => u.Id != authUser.Id);

                List<User> notYetPartialFriendsSearched = null;

                if (!string.IsNullOrWhiteSpace(searchTerm))
                    notYetPartialFriendsSearched = queryNotYetPartialFriends.Where(u => u.UserName.Contains(searchTerm))
                        .AsEnumerable().OrderBy(u => u?.UserName).ToList();

                var notYetPartialFriends = queryNotYetPartialFriends.ToList();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Poprawnie wyświetlono Panel Znajomych",
                    ResultsCount = notYetPartialFriendsSearched?.Count ?? notYetPartialFriends.Count,
                    PartialView = RenderPartialView("_FriendsPanel", notYetPartialFriendsSearched ?? notYetPartialFriends)
                });
            }
            catch (ValidationException)
            {
                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.ValidationError),
                    Message = "Walidacja zwróciła błędy",
                    ValidationErrors = GetValidationErrorList()
                });
            }
            catch (MySqlException)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza Danych nie odpowiada",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError),
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = ex.Message,
                    Status = Enum.GetName(typeof(ActionStatus), Status == ActionStatus.None ? ActionStatus.Failure : Status)
                });
            }
        }
        
        public string AddFriend(User friend)
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var loggedUser = CheckIfLogged();
                CheckIfUserIsDifferentThanLogged(loggedUser, friend, db);
                CheckIfAddedToFriends(loggedUser, friend, db);

                var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Single(u => u.Id == loggedUser.Id);
                var dbFriend = db.Users.Find(friend.Id);
                dbLoggedUser.AddedToFriends.Add(dbFriend);
                db.SaveChanges();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Dodano do znajomych"
                });
            }
            catch (MySqlException)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza Danych nie odpowiada",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError),
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = ex.Message,
                    Status = Enum.GetName(typeof(ActionStatus), Status == ActionStatus.None ? ActionStatus.Failure : Status)
                });
            }
        }

        #endregion

        #region === PANEL POWIADOMIEŃ ===

        public string RenderNotificationsPanel()
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var loggedUser = CheckIfLogged();

                var dbLoggedUser = db.Users.Single(u => u.Id == loggedUser.Id);
                db.Entry(dbLoggedUser).Collection(u => u.ReceivedNotifications).Load();

                var notifications = dbLoggedUser.ReceivedNotifications.ToList();

                if (notifications.Count <= 0)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        PartialView = RenderPartialView("_NotificationsPanel", notifications),
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.NoResults),
                        Message = "Brak Wyników"
                    });
                }
                
                foreach (var notification in notifications)
                {
                    var notificationEntry = db.Entry(notification);
                    notificationEntry.Reference(n => n.FromUser).Load();
                    notificationEntry.Reference(n => n.ToUser).Load();
                    notificationEntry.Reference(n => n.Message).Load();
                }

                notifications = notifications.OrderByDescending(n => n.Message.CreationTime).ToList();

                return JsonConvert.SerializeObject(new
                {
                    PartialView = RenderPartialView("_NotificationsPanel", notifications),
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Poprawnie wczytano [_NotificationsPanel]"
                });
            }
            catch (MySqlException)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza Danych nie odpowiada",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError),
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = ex.Message,
                    Status = Enum.GetName(typeof(ActionStatus), Status == ActionStatus.None 
                        ? ActionStatus.Failure : Status)
                });
            }
        }

        public string RemoveNotification(string notifId)
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                CheckIfLogged();

                var ids = notifId.Split('|');
                var fromUserId = Guid.Parse(ids[0]);
                var toUserId = Guid.Parse(ids[1]);
                var messageId = Guid.Parse(ids[2]);
                var dbNotification = db.Notifications.Single(n =>
                    n.FromUserId == fromUserId &&
                    n.ToUserId == toUserId &&
                    n.MessageId == messageId);

                db.Entry(dbNotification).Reference(n => n.Message).Load();
                var message = dbNotification.Message;
                db.Notifications.Remove(dbNotification);
                
                if (!message.Notifications.Any())
                    db.Messages.Remove(message);
                db.SaveChanges();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Powiadomienie zostało usunięte"
                });
            }
            catch (MySqlException)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza Danych nie odpowiada",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError),
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = ex.Message,
                    Status = Enum.GetName(typeof(ActionStatus), Status == ActionStatus.None ? ActionStatus.Failure : Status)
                });
            }
        }

        #endregion

        #region === WERYFIKACJA ===

        public void CheckIfAjax()
        {
            if (Request.IsAjaxRequest()) return;
            Status = ActionStatus.NotAjaxRequest;
            throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");
        }

        public UserToLoginViewModel CheckIfLogged()
        {
            var loggedUser = UserToLoginViewModel.GetAuthenticated();
            if (loggedUser != null) return loggedUser;
            Status = ActionStatus.NotLogged; 
            throw new Exception("Nie jesteś zalogowany");
        }

        public void CheckIfUserIsDifferentThanLogged(UserToLoginViewModel loggedUser, User friend, ProjectDbContext db)
        {
            var isUserSameAsLogged = friend.Id == loggedUser.Id;
            
            if (isUserSameAsLogged)
            {
                Status = ActionStatus.UserIsSameAsLogged;
                throw new Exception("Nie możesz manipulować kontem na które jesteś zalogowany");
            }
        }

        public void CheckIfAddedToFriends(UserToLoginViewModel loggedUser, User friend, ProjectDbContext db)
        {
            var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Single(u => u.Id == loggedUser.Id);
            var isAlreadyAddedToFriends = dbLoggedUser.HasAddedToFriends(friend);

            if (isAlreadyAddedToFriends)
            {
                Status = ActionStatus.IsAlreadyFriend;
                throw new Exception("Użytkownik został już dodany");
            }
        }

        public void CheckIfNotAddedToFriends(UserToLoginViewModel loggedUser, User friend, ProjectDbContext db)
        {
            var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Single(u => u.Id == loggedUser.Id);
            var isAlreadyAddedToFriends = dbLoggedUser.HasAddedToFriends(friend);

            if (!isAlreadyAddedToFriends)
            {
                Status = ActionStatus.IsAlreadyFriend;
                throw new Exception("Użytkownik nie jest dodany do znajomych");
            }
        }

        public void CheckIfFriend(UserToLoginViewModel loggedUser, User friend, ProjectDbContext db)
        {
            var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Include(u => u.AddedAsFriendBy).Single(u => u.Id == loggedUser.Id);
            var isFriend = dbLoggedUser.IsFriendWith(friend);

            if (isFriend)
            {
                Status = ActionStatus.IsAlreadyFriend;
                throw new Exception("Użytkownik znajduje się w znajomych");
            }
        }

        public void CheckIfNotFriend(UserToLoginViewModel loggedUser, User friend, ProjectDbContext db)
        {
            var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Include(u => u.AddedAsFriendBy).Single(u => u.Id == loggedUser.Id);
            var isFriend = dbLoggedUser.IsFriendWith(friend);

            if (!isFriend)
            {
                Status = ActionStatus.IsAlreadyFriend;
                throw new Exception("Użytkownik nie znajduje się w znajomych");
            }
        }

        protected void CheckIfIdsAreInDb(IReadOnlyCollection<Guid> ids, ProjectDbContext db)
        {
            var matches = Enumerable.Count(db.Users, u => ids.Any(id => id == u.Id));

            if (matches == ids.Count) return;

            Status = ActionStatus.NotAllUsersIdsInDb;
            throw new Exception("Nie wszyscy wskazani znajomi istnieją w bazie danych");
        }

        protected void CheckIfAllUsersAreDifferentThanLogged(User loggedUser, User[] selectedusers, ProjectDbContext db)
        {
            if (selectedusers.All(u => u.Id != loggedUser.Id)) return;

            Status = ActionStatus.UserIsSameAsLogged;
            throw new Exception("Nie możesz manipulować kontem na które jesteś zalogowany");
        }

        protected void CheckIfAllAreFriends(User loggedUser, User[] selectedusers, ProjectDbContext db)
        {
            foreach (var u in selectedusers)
            {
                db.Entry(u).Collection(c => c.AddedToFriends).Load();
                db.Entry(u).Collection(c => c.AddedAsFriendBy).Load();
            }

            if (selectedusers.All(u => u.IsFriendWith(loggedUser))) return;

            Status = ActionStatus.NotAllUsersAreFriends;
            throw new Exception("Nie wszyscy użytkownicy są znajomymi");
        }

        protected void CheckIfNotificationNotEmpty(string notificationTitle, string notificationContent)
        {
            if (!string.IsNullOrWhiteSpace(notificationTitle) && !string.IsNullOrWhiteSpace(notificationContent))
                return;

            Status = ActionStatus.Failure;
            throw new Exception("Powiadomienie nie zawiera żadnej treści do wysłania");
        }

        protected void CheckIfAnyIdIsSelected(Guid[] selectedIds)
        {
            if (selectedIds != null && selectedIds.Length > 0)
                return;

            Status = ActionStatus.NoIdsSelected;
            throw new Exception("Nie wybrano żadnych znajomych");
        }

        public void CheckModelValidation()
        {
            if (!ModelState.IsValid)
                throw new ValidationException("Walidacja zwróciła błędy");
        }

        private IEnumerable<PropertyError> GetValidationErrorList()
        {
            return (
                from kvp in ModelState
                from err in kvp.Value.Errors
                select new PropertyError(kvp.Key, err.ErrorMessage)
            ).ToList();
        }

        #endregion
    }

    public enum ActionStatus
    {
        Success = 0,
        Failure = 1,
        DatabaseError = 2,
        AccountLocked = 3,
        AccountNotActivated = 4,
        SendingEmailFailure = 5,
        UserDoesNotExist = 6,
        AccountAlreadyActivated = 7,
        NotLogged = 8,
        ValidationError,
        IsAlreadyFriend,
        NotAjaxRequest,
        None,
        UserIsSameAsLogged,
        NotAllUsersIdsInDb,
        NotAllUsersAreFriends,
        NoIdsSelected,
        NoResults
    }
}
