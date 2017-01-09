using System;
using System.Collections.Generic;
using System.Data;
using System.Data.Entity;
using System.IO;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using System.Xml.Linq;
using MoreLinq;
using MVCDemo.Models;
using Newtonsoft.Json;
using MVCDemo.Common;
using MySql.Data.MySqlClient;
using static MVCDemo.Models.AutoMapperConfiguration;

namespace MVCDemo.Controllers
{
    public class UserController : BaseController
    {
        //public ActionResult Index()
        //{
        //    return View();
        //}
        
        public ViewResult Register(bool displayRegisterPanel = false, bool displayActivateAccountPanel = false, bool displayRemindPasswordPanel = false)
        {
            Session["DisplayRegisterPanels"] = new
            {
                RegisterPanel = displayRegisterPanel,
                ActivateAccountPanel = displayActivateAccountPanel,
                RemindPasswordPanel = displayRemindPasswordPanel
            };
            return View();
        }

        public string GetRegisterPanel()
        {
            //Thread.Sleep(5000);
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            dynamic displayPanels = Session["DisplayRegisterPanels"];
            return JsonConvert.SerializeObject(new
            {
                DisplayPanel = displayPanels?.GetType()?.GetProperty("RegisterPanel") != null ? displayPanels.RegisterPanel : false,
                PartialView = RenderPartialView("_RegisterPanel", new UserToRegisterViewModel())
            });
        }

        public string GetActivateAccountPanel()
        {
            //Thread.Sleep(5000);
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            dynamic displayPanels = Session["DisplayRegisterPanels"];
            return JsonConvert.SerializeObject(new
            {
                DisplayPanel = displayPanels?.GetType()?.GetProperty("ActivateAccountPanel") != null ? displayPanels.ActivateAccountPanel : false,
                PartialView = RenderPartialView("_ActivateAccountPanel", new UserToActivateViewModel())
            });
        }

        public string GetRemindPasswordPanel()
        {
            //Thread.Sleep(5000);
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            dynamic displayPanels = Session["DisplayRegisterPanels"];
            return JsonConvert.SerializeObject(new
            {
                DisplayPanel = displayPanels?.GetType()?.GetProperty("RemindPasswordPanel") != null ? displayPanels.RemindPasswordPanel : false,
                PartialView = RenderPartialView("_RemindPasswordPanel", new UserToRemindPasswordViewModel())
            });
        }

        public string RegisterUser([Bind(Include = "UserName,Password,ConfirmPassword,Email")] UserToRegisterViewModel userToRegister)
        {
            //Thread.Sleep(5000);
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            Mapper.Map(userToRegister, user);
            var registrationResult = user.Register();
            var sendActivationResult = user.SendActivationLink();
            
            if (registrationResult == ActionStatus.DatabaseError || sendActivationResult == ActionStatus.DatabaseError)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza danych nie odpowiada",
                    Result = ActionStatus.DatabaseError,
                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                });
            }

            if (sendActivationResult == ActionStatus.AccountAlreadyActivated)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Użytkownik został już aktywowany",
                    Result = ActionStatus.AccountAlreadyActivated,
                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.AccountAlreadyActivated)
                });
            }

            if (sendActivationResult == ActionStatus.SendingEmailFailure)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Rejestracja poprawna, ale Email aktywacyjny nie został wysłany",
                    Result = ActionStatus.SendingEmailFailure,
                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.SendingEmailFailure)
                });
            }

            if (registrationResult == ActionStatus.Success && sendActivationResult == ActionStatus.Success)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = $"Rejestracja prawidłowa, link aktywacyjny wysłano do: <span class=\"linklike\">{user.Email}</span>",
                    Result = ActionStatus.Success,
                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.Success)
                });
            }

            throw new ArgumentOutOfRangeException();
        }

        public string ActivateUserAccount([Bind(Include = "ActivationEmail,ActivationCode")] UserToActivateViewModel userToActivate)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            Mapper.Map(userToActivate, user);
            var activationResult = user.Activate();

            switch (activationResult)
            {
                case ActionStatus.Success:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = $"Konto <span class=\"linklike\">{user.UserName}</span> zostało Aktywowane",
                        Result = ActionStatus.Success,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                    });
                }
                case ActionStatus.DatabaseError:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                case ActionStatus.AccountAlreadyActivated:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Użytkownik został już aktywowany",
                        Result = ActionStatus.AccountAlreadyActivated,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.AccountAlreadyActivated)
                    });
                }
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public string SendActivationEmailAgain([Bind(Include = "ActivationEmail")] UserToSendActivationCodeViewModel userToSendActivationCode)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            ModelState.Remove("ActivationCode");
            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");
                
            var user = new User();
            Mapper.Map(userToSendActivationCode, user);
            Session["EmailData"] = Server.MapPath("~/Data/Email.xml");
            var sendActivationResult = user.SendActivationLink();
            user.ActivationEmail = user.Email;

            switch (sendActivationResult)
            {
                case ActionStatus.DatabaseError:
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                case ActionStatus.AccountAlreadyActivated:
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Użytkownik został już aktywowany",
                        Result = ActionStatus.AccountAlreadyActivated,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.AccountAlreadyActivated)
                    });
                case ActionStatus.SendingEmailFailure:
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Email aktywacyjny nie został wysłany",
                        Result = ActionStatus.SendingEmailFailure,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.SendingEmailFailure)
                    });
                case ActionStatus.Success:
                    return JsonConvert.SerializeObject(new
                    {
                        Message = $"Link aktywacyjny wysłano do: <span class=\"linklike\">{user.ActivationEmail}</span>",
                        Result = ActionStatus.Success,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                    });
            }

            throw new ArgumentOutOfRangeException();
        }

        public string RemindUserPassword([Bind(Include = "RemindPasswordEmail,RemindPasswordCode,RemindPasswordOldPassword,RemindPasswordNewPassword,RemindPasswordConfirmPassword")] UserToRemindPasswordViewModel userToRemindPassword)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            Mapper.Map(userToRemindPassword, user);
            var activationResult = user.RemindPassword();

            switch (activationResult)
            {
                case ActionStatus.Success:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = $"Hasło do konta użytkownika: <span class=\"linklike\">{user.UserName}</span> zostało Zmienione",
                        Result = ActionStatus.Success,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                    });
                }
                case ActionStatus.DatabaseError:
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                default:
                    throw new ArgumentOutOfRangeException();
            }
        }

        public string SendRemindPasswordRequest([Bind(Include = "RemindPasswordEmail")] UserToSendRemindPasswordRequestViewModel userToSendRemindPasswordRequest)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            ModelState.Remove("ActivationCode");
            if (!ModelState.IsValid)
                throw new Exception("Walidacja użytkownika nie powiodła się");

            var user = new User();
            Mapper.Map(userToSendRemindPasswordRequest, user);
            Session["EmailData"] = Server.MapPath("~/Data/Email.xml");
            var sendRemindPasswordResult = user.SendRemindPasswordRequest();
            user.RemindPasswordEmail = user.Email; // ponieważ mapowanie w SendEmail usunie wartość RemindPasswordEmail

            switch (sendRemindPasswordResult)
            {
                case ActionStatus.DatabaseError:
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                case ActionStatus.SendingEmailFailure:
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Email z kodem weryfikacyjnym nie został wysłany",
                        Result = ActionStatus.SendingEmailFailure,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.SendingEmailFailure)
                    });
                case ActionStatus.Success:
                    return JsonConvert.SerializeObject(new
                    {
                        Message = $"Kod weryfikacyjny wysłano do: <span class=\"linklike\">{user.RemindPasswordEmail}</span>",
                        Result = ActionStatus.Success,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                    });
            }

            throw new ArgumentOutOfRangeException();
        }

        public string IsUserNameAvailable(string userName)
        {
            //Thread.Sleep(3000);
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var isUserNameAvailable = !db.Users.Any(x => x.UserName == userName); // nie wymaga case sensitive, bo jest porównywany w bd
                    return JsonConvert.SerializeObject(new
                    {
                        Message = isUserNameAvailable ? "" : "Nazwa Użytkownika jest już używana",
                        Result = isUserNameAvailable ? ActionStatus.Success : ActionStatus.Failure,
                        ResultString = isUserNameAvailable ? Enum.GetName(typeof (ActionStatus), ActionStatus.Success) : Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsEmailAvailable(string email)
        {
            //Thread.Sleep(5000);
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var isEmailAvailable = !db.Users.Any(x => x.Email == email);
                    return JsonConvert.SerializeObject(new
                    {
                        Message = isEmailAvailable ? "" : "Email jest już używany",
                        Result = isEmailAvailable ? ActionStatus.Success : ActionStatus.Failure,
                        ResultString = isEmailAvailable ? Enum.GetName(typeof (ActionStatus), ActionStatus.Success) : Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsEmailInDatabaseAjax(User user)
        {
            if (!Request.IsAjaxRequest())
                throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

            return IsEmailInDatabase(user.Email ?? user.ActivationEmail ?? user.RemindPasswordEmail);
        }

        public string IsEmailInDatabase(string email)
        {
            //Thread.Sleep(2000);
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var isEmailInDatabase = db.Users.Any(x => x.Email == email);
                    return JsonConvert.SerializeObject(new
                    {
                        Message = isEmailInDatabase ? "" : "Email nie znajduje się w Bazie Danych",
                        Result = isEmailInDatabase ? ActionStatus.Success : ActionStatus.Failure,
                        ResultString = isEmailInDatabase ? Enum.GetName(typeof (ActionStatus), ActionStatus.Success) : Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsActivationCodeValid(string activationCode, string activationEmail)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    if (db.Users.Any(u => u.Email == activationEmail))
                    {
                        var currUserId = db.Users.Single(u => u.Email == activationEmail).Id;
                        var userRequestsDesc =
                            db.ActivationRequests.Where(x => x.UserId == currUserId)
                                .OrderByDescending(x => x.ActivationRequestDateTime);
                        db.ActivationRequests.RemoveRange(userRequestsDesc.Skip(1));
                        db.SaveChanges();

                        if (userRequestsDesc.Count() == 1)
                        {
                            var lastReq = userRequestsDesc.Single();
                            var isActivationCodeValid = activationCode == lastReq.Id.ToString();

                            if (isActivationCodeValid)
                            {
                                return JsonConvert.SerializeObject(new
                                {
                                    Message = "",
                                    Result = ActionStatus.Success,
                                    ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.Success)
                                });
                            }
                        }
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Kod aktywacyjny dla podanego Emaila jest błędny",
                        Result = ActionStatus.Failure,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof (ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsRemindPasswordCodeValid(string remindPasswordCode, string remindPasswordEmail)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    if (db.Users.Any(u => u.Email == remindPasswordEmail))
                    {
                        var currUserId = db.Users.Single(u => u.Email == remindPasswordEmail).Id;
                        var userRequestsDesc =
                            db.RemindPasswordRequests.Where(x => x.UserId == currUserId)
                                .OrderByDescending(x => x.RemindPasswordRequestDateTime);
                        db.RemindPasswordRequests.RemoveRange(userRequestsDesc.Skip(1));
                        db.SaveChanges();

                        if (userRequestsDesc.Count() == 1)
                        {
                            var lastReq = userRequestsDesc.Single();
                            var isActivationCodeValid = remindPasswordCode == lastReq.Id.ToString();

                            if (isActivationCodeValid)
                            {
                                return JsonConvert.SerializeObject(new
                                {
                                    Message = "",
                                    Result = ActionStatus.Success,
                                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                                });
                            }
                        }
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Kod Weryfikacyjny dla podanego Emaila jest błędny",
                        Result = ActionStatus.Failure,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public string IsRemindPasswordOldPasswordValid(string remindPasswordOldPassword, string remindPasswordEmail)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    if (db.Users.Any(u => u.Email == remindPasswordEmail))
                    {
                        var currUser = db.Users.Single(u => u.Email == remindPasswordEmail);
                        var userRequestsDesc =
                            db.RemindPasswordRequests.Where(x => x.UserId == currUser.Id)
                                .OrderByDescending(x => x.RemindPasswordRequestDateTime);
                        db.RemindPasswordRequests.RemoveRange(userRequestsDesc.Skip(1));
                        db.SaveChanges();

                        if (userRequestsDesc.Count() == 1)
                        {
                            //var lastReq = userRequestsDesc.Single();
                            var isOldPasswordValid = Encryption.VerifyHash(remindPasswordOldPassword, HashAlgorithmType.SHA512, currUser.Password) == currUser.Password;

                            if (isOldPasswordValid)
                            {
                                return JsonConvert.SerializeObject(new
                                {
                                    Message = "",
                                    Result = ActionStatus.Success,
                                    ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                                });
                            }
                        }
                    }

                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Stare Hasło dla użytkownika o podanym Emailu jest błędne",
                        Result = ActionStatus.Failure,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure)
                    });
                }
                catch (Exception)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Baza Danych nie odpowiada",
                        Result = ActionStatus.DatabaseError,
                        ResultString = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                    });
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionResult Edit()
        {
            return View();
        }

        public string RenderEditPanel()
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var loggedUser = CheckIfLogged();

                var dbUser = db.Users.Include(u => u.Avatar).Single(u => u.Id == loggedUser.Id);
                var userToEdit = new UserToEditViewModel();
                Mapper.Map(dbUser, userToEdit);

                ViewBag.Location = dbUser.GetLocation();
                return JsonConvert.SerializeObject(new
                {
                    PartialView = RenderPartialView("_EditPanel", userToEdit),
                    Message = "Poprawnie wczytano [_EditPanel]",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
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

        public string RenderActiveFriendsPanel(UserToEditViewModel userToEdit)
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var loggedUser = CheckIfLogged();
                var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Include(u => u.AddedAsFriendBy)
                    .Single(u => u.Id == loggedUser.Id);

                var partialFriends = dbLoggedUser.AddedToFriends
                    .Concat(dbLoggedUser.AddedAsFriendBy).Distinct().OrderBy(u => u.UserName).ToList();

                var partialFriendsCount = partialFriends.Count;

                if (partialFriendsCount > 0)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        ResultsCount = partialFriendsCount,
                        PartialView = RenderPartialView("_ActiveFriendsPanel", partialFriends),
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                        Message = "Poprawnie wczytano [_ActiveFriendsPanel]"
                    });
                }

                return JsonConvert.SerializeObject(new
                {
                    ResultsCount = partialFriendsCount,
                    PartialView = RenderPartialView("_ActiveFriendsPanel", partialFriends),
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Brak Wyników"
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

        public string SaveChanges([Bind(Include = "Email,Avatar")] UserToEditViewModel userToEdit)
        {
            var db = new ProjectDbContext();
            try
            {
                if (!Request.IsAjaxRequest())
                    throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");

                var loggedUser = UserToLoginViewModel.GetAuthenticated();
                if (loggedUser == null)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.NotLogged),
                        Message = "Nie jesteś zalogowany lub nie masz uprawnień",
                        ValidationErrors = new List<PropertyError>(),
                        Path = string.Empty
                    });
                }

                var dbUser = db.Users.Include(u => u.Avatar).Single(u => u.Id == loggedUser.Id);
                userToEdit.Avatar = dbUser.Avatar;
                
                var validationErrors = ValidateNotNullProperties(userToEdit);
                var validProperties = userToEdit.GetType().GetProperties()
                    .Where(p => p.GetValue(userToEdit, null) != null && !validationErrors
                        .DistinctBy(e => e.PropertyName)
                        .Select(e => e.PropertyName).ToArray().Contains(p.Name))
                    .Select(pi => pi.Name).ToArray();

                if (validationErrors.Count > 0)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.ValidationError),
                        Message = "Walidacja zwróciła błędy",
                        ValidationErrors = validationErrors,
                        ValidProperties = validProperties
                    });
                }
                
                dbUser.Email = userToEdit.Email;
                db.SaveChanges();
                
                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Poprawnie zapisano zmiany profilu",
                    ValidProperties = validProperties
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
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });
            }
            finally
            {
                if (db.Database.Connection.State == ConnectionState.Open)
                    db.Database.Connection.Close();
            }
        }

        public string UploadAvatar()
        {
            var db = new ProjectDbContext();
            try
            {
                if (!Request.IsAjaxRequest())
                    throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");
                var loggedUser = UserToLoginViewModel.GetAuthenticated();
                if (loggedUser == null)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.NotLogged),
                        Message = "Nie jesteś zalogowany lub nie masz uprawnień",
                        ValidationErrors = new List<PropertyError>(),
                        Path = string.Empty
                    });
                }
                var dbUser = db.Users.Include(u => u.Avatar).Single(u => u.Id == loggedUser.Id);
                var avatar = dbUser.Avatar;
                dbUser.AvatarId = null;
                dbUser.Avatar = null;
                if (avatar != null) db.Images.Remove(avatar);
                var userToEdit = new UserToEditViewModel();

                Mapper.Map(dbUser, userToEdit);
                var file = Request.Files[0];
                if (file == null) throw new Exception("Brak Pliku");
                var stream = file.InputStream;
                var br = new BinaryReader(stream);
                var bytes = br.ReadBytes((int)stream.Length);
                userToEdit.Avatar = new Image
                {
                    Id = Guid.NewGuid(),
                    ImageData = bytes,
                    ImagePath = file.FileName
                };

                var validationErrors = ValidateNotNullProperties(userToEdit);
                
                if (validationErrors.Count > 0)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.ValidationError),
                        Message = "Walidacja zwróciła błędy",
                        ValidationErrors = validationErrors,
                        Path = string.Empty
                    });
                }

                dbUser.Avatar = userToEdit.Avatar;
                db.SaveChanges();

                var extension = Path.GetExtension(file.FileName)?.Replace(".", "");
                var strBase64 = Convert.ToBase64String(bytes);

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Pomyślnie zmieniono awatar",
                    Path = $"data:Image/{extension};base64,{strBase64}"
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
                if (GlobalHelper.IsMaxRequestExceededException(ex))
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Message = "Wskazany Plik jest zbyt duży aby go przetworzyć",
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                    });
                }

                return JsonConvert.SerializeObject(new
                {
                    Message = "Podczas przesyłania pliku wystapił błąd",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });
            }
            finally
            {
                if (db.Database.Connection.State == ConnectionState.Open)
                    db.Database.Connection.Close();
            }
        }

        public string DeleteAvatar()
        {
            var db = new ProjectDbContext();
            try
            {
                if (!Request.IsAjaxRequest())
                    throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");
                var loggedUser = UserToLoginViewModel.GetAuthenticated();
                if (loggedUser == null)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.NotLogged),
                        Message = "Nie jesteś zalogowany lub nie masz uprawnień",
                        ValidationErrors = new List<PropertyError>(),
                        Path = string.Empty
                    });
                }
                var dbUser = db.Users.Include(u => u.Avatar).Single(u => u.Id == loggedUser.Id);
                var avatar = dbUser.Avatar;
                dbUser.AvatarId = null;
                dbUser.Avatar = null;
                db.Images.Remove(avatar);
                db.SaveChanges();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Pomyślnie usunięto awatar",
                    Path = $@"{Url.Content("~/")}Images/No_Image_Available.png"
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
                    Message = "Podczas usuwania awatara wystapił błąd",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });
            }
            finally
            {
                if (db.Database.Connection.State == ConnectionState.Open)
                    db.Database.Connection.Close();
            }
        }

        public string RemoveFriend(User friend)
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var loggedUser = CheckIfLogged();
                CheckIfUserIsDifferentThanLogged(loggedUser, friend, db);
                CheckIfNotFriend(loggedUser, friend, db);

                var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Include(u => u.AddedAsFriendBy).Single(u => u.Id == loggedUser.Id);
                var dbFriend = db.Users.Find(friend.Id);
                dbLoggedUser.AddedToFriends.Remove(dbFriend);
                dbLoggedUser.AddedAsFriendBy.Remove(dbFriend);
                db.SaveChanges();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Usunięto ze znajomych"
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

        public string CancelFriendInvitation(User friend)
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var loggedUser = CheckIfLogged();
                CheckIfUserIsDifferentThanLogged(loggedUser, friend, db);
                CheckIfNotAddedToFriends(loggedUser, friend, db);

                var dbLoggedUser = db.Users.Include(u => u.AddedToFriends).Single(u => u.Id == loggedUser.Id);
                var dbFriend = db.Users.Find(friend.Id);
                dbLoggedUser.AddedToFriends.Remove(dbFriend);
                db.SaveChanges();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Anulowano zaproszenie"
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

        public string AcceptFriendInvite(User friend)
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
                    Message = "Akecptowano zaproszenie do znajomych"
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

        public string DeclineFriendInvite(User friend)
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
                dbLoggedUser.AddedAsFriendBy.Remove(dbFriend);
                db.SaveChanges();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Odrzucono zaproszenie do znajomych"
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

        public string SendNotification(Guid[] selectedIds, string notificationTitle, string notificationContent)
        {
            var db = new ProjectDbContext();
            Status = ActionStatus.None;

            try
            {
                CheckIfAjax();
                var loggedUser = CheckIfLogged();
                CheckIfAnyIdIsSelected(selectedIds);
                CheckIfIdsAreInDb(selectedIds, db);
                CheckIfNotificationNotEmpty(notificationTitle, notificationContent);

                var dbSelectedUsers = selectedIds.Select(id => db.Users.Single(u => u.Id == id)).ToArray();
                var dbLoggedUser = db.Users.Single(u => u.Id == loggedUser.Id);

                CheckIfAllUsersAreDifferentThanLogged(dbLoggedUser, dbSelectedUsers, db);
                CheckIfAllAreFriends(dbLoggedUser, dbSelectedUsers, db);
                
                var guid = Guid.NewGuid();
                var message = new Message
                {
                    Id = guid,
                    CreationTime = DateTime.UtcNow,
                    Title = notificationTitle,
                    Content = notificationContent,
                    Notifications = new HashSet<Notification>()
                };

                foreach (var u in dbSelectedUsers)
                {
                    message.Notifications.Add(new Notification
                    {
                        FromUserId = loggedUser.Id,
                        ToUserId = u.Id,
                        MessageId = guid,
                    });
                }
                
                db.Messages.Add(message);
                db.SaveChanges();

                return JsonConvert.SerializeObject(new
                {
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success),
                    Message = "Wysłano powiadomienie"
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

        public string ValidateUserToEditProperty(UserToEditViewModel userToEdit)
        {
            var db = new ProjectDbContext();
            try
            {
                if (!Request.IsAjaxRequest())
                    throw new Exception("Zapytanie nie zostało wywołane jako zapytanie AJAX");
                var loggedUser = UserToLoginViewModel.GetAuthenticated();
                if (loggedUser == null)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.NotLogged),
                        Message = "Nie jesteś zalogowany lub nie masz uprawnień",
                        ValidationErrors = new List<PropertyError>(),
                        Path = string.Empty
                    });
                }

                var validationErrors = ValidateNotNullProperties(userToEdit);

                if (validationErrors.Count > 0)
                {
                    return JsonConvert.SerializeObject(new
                    {
                        Status = Enum.GetName(typeof(ActionStatus), ActionStatus.ValidationError),
                        Message = "Walidacja zwróciła błędy",
                        ValidationErrors = validationErrors
                    });
                }
                
                return JsonConvert.SerializeObject(new
                {
                    Message = "Email jest poprawny",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Success)
                });
            }
            catch (MySqlException)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = "Baza Danych nie odpowiada",
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.DatabaseError)
                });
            }
            catch (Exception ex)
            {
                return JsonConvert.SerializeObject(new
                {
                    Message = ex.Message,
                    Status = Enum.GetName(typeof(ActionStatus), ActionStatus.Failure),
                });
            }
            finally
            {
                if (db.Database.Connection.State == ConnectionState.Open)
                    db.Database.Connection.Close();
            }
        }

        public List<PropertyError> ValidateNotNullProperties(UserToEditViewModel userToEdit)
        {
            var propNames = userToEdit.GetType().GetProperties()
                .Where(p => p.GetValue(userToEdit, null) != null)
                .Select(p => p.Name)
                .ToArray();

            ModelState.Clear();
            TryValidateModel(userToEdit);
            return (
                from kvp in ModelState
                where propNames.Contains(kvp.Key)
                from err in kvp.Value.Errors
                select new PropertyError(kvp.Key, err.ErrorMessage)).ToList();
        }
    }
}