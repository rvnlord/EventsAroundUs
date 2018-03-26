using System.Diagnostics.CodeAnalysis;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Data;
using System.Data.Entity;
using System.Diagnostics;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Text;
using System.Threading.Tasks;
using System.Web;
using System.Xml.Linq;
using MVCDemo.Common;
using MVCDemo.Controllers;
using Newtonsoft.Json;
using static MVCDemo.Common.Encryption;
using static MVCDemo.Common.Extensions;
using static MVCDemo.Controllers.BaseController;
using static MVCDemo.Models.AutoMapperConfiguration;

namespace MVCDemo.Models
{
    [Table("project.tblusers")]
    public class User : UserUtilities
    {
        public User()
        {
            ActivationRequests = new HashSet<ActivationRequest>();
            AddedToFriends = new HashSet<User>();
            AddedAsFriendBy = new HashSet<User>();
            RemindPasswordRequests = new HashSet<RemindPasswordRequest>();
        }

        public Guid Id { get; set; }
        
        public string UserName { get; set; }

        [StringLength(200)]
        public string Password { get; set; }

        [NotMapped]
        public string ConfirmPassword { get; set; }

        [StringLength(200)]
        public string Email { get; set; }

        [NotMapped]
        public string ActivationEmail { get; set; }

        [NotMapped]
        public string ActivationCode { get; set; }

        [NotMapped]
        public string RemindPasswordEmail { get; set; }

        [NotMapped]
        public string RemindPasswordCode { get; set; }

        [NotMapped]
        public string RemindPasswordOldPassword { get; set; }

        [NotMapped]
        public string RemindPasswordNewPassword { get; set; }

        [NotMapped]
        public string RemindPasswordConfirmPassword { get; set; }

        public DateTime? RegistrationDate { get; set; }

        public int? RetryAttempts { get; set; }

        public int? IsLocked { get; set; }

        public int? IsActivated { get; set; }

        public int? AccessLevel { get; set; }

        public Guid? AvatarId { get; set; }

        public DateTime? LockedDateTime { get; set; }

        public ICollection<ActivationRequest> ActivationRequests { get; set; }

        public ICollection<RemindPasswordRequest> RemindPasswordRequests { get; set; }

        public ICollection<Notification> SentNotifications { get; set; }

        public ICollection<Notification> ReceivedNotifications { get; set; }
        
        [Column(TypeName = "uint")]
        public override long? CurrentIp { get; set; }

        public bool IsFriendWith(User user)
        {
            return HasAddedToFriends(user) && IsAddedAsFriendBy(user);
        }

        public bool HasAddedToFriends(User user)
        {
            return AddedToFriends.Any(u => u == user);
        }
        
        public bool IsAddedAsFriendBy(User user)
        {
            return AddedAsFriendBy.Any(u => u == user);
        }

        public virtual ICollection<User> AddedToFriends { get; set; }

        [InverseProperty("AddedToFriends")]
        public virtual ICollection<User> AddedAsFriendBy { get; set; }

        public virtual Image Avatar { get; set; }

        [NotMapped]
        public bool RememberMe { get; set; }
        
        public ActionStatus Authenticate(bool useHash = false)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    db.Configuration.ValidateOnSaveEnabled = false; // wyłącz walidację pól podczas logowania
                    var dbUsers = db.Users.Where(u => u.UserName.Equals(UserName)).ToList();
                    var dbUserCount = dbUsers.Count;

                    if (dbUserCount < 1)
                        return ActionStatus.UserDoesNotExist;
                    if (dbUserCount > 1)
                        throw new Exception("Istnieje więcej niż jeden użytkownik o podanej nazwie");

                    var dbUser = dbUsers.Single();

                    var password = !useHash ? VerifyHash(Password ?? "", HashAlgorithmType.SHA512, dbUser.Password) : Password;
                    
                    Id = dbUser.Id;
                    UserName = dbUser.UserName;
                    Password = dbUser.Password;
                    Email = dbUser.Email;
                    RegistrationDate = dbUser.RegistrationDate;
                    RetryAttempts = dbUser.RetryAttempts;
                    IsLocked = dbUser.IsLocked;
                    LockedDateTime = dbUser.LockedDateTime;
                    IsActivated = dbUser.IsActivated;

                    if (Convert.ToBoolean(dbUser.IsLocked)) // Konto Zablokowane
                    {
                        int secondsToUnlock;
                        if (LockedDateTime != null)
                            secondsToUnlock = (int) (15 * 60 - DateTime.Now.Subtract((DateTime)LockedDateTime).TotalSeconds);
                        else
                            throw new NullReferenceException();

                        if (secondsToUnlock >= 0)
                            return ActionStatus.AccountLocked;

                        dbUser.IsLocked = 0;
                        dbUser.RetryAttempts = 0;
                        IsLocked = dbUser.IsLocked;
                        RetryAttempts = dbUser.RetryAttempts;
                    }

                    if (!Convert.ToBoolean(dbUser.IsActivated)) // Konto Nieaktywowane
                        return ActionStatus.AccountNotActivated;
                    
                    if (dbUser.Password == password) // Hasło Poprawne i Konto bez flag
                    {
                        dbUser.RetryAttempts = 0;
                        dbUser.IsLocked = 0;
                        IsLocked = dbUser.IsLocked;
                        RetryAttempts = dbUser.RetryAttempts;
                        dbUser.CurrentIp = ConvertIpToUint(GetIpAddress());
                        db.SaveChanges();

                        Password = password;
                        
                        return ActionStatus.Success;
                    }

                    if (dbUser.RetryAttempts == null)
                        dbUser.RetryAttempts = 0;

                    dbUser.RetryAttempts++;
                    RetryAttempts = dbUser.RetryAttempts;

                    if (dbUser.RetryAttempts <= 3) // Hasło Niepoprawne i liczba prób mniejsza lub równa 3
                    {
                        db.SaveChanges();
                        return ActionStatus.Failure;
                    }

                    dbUser.LockedDateTime = DateTime.Now; // Hasło Niepoprawne i liczba prób większa niż 3
                    dbUser.IsLocked = 1;
                    LockedDateTime = dbUser.LockedDateTime;
                    IsLocked = dbUser.IsLocked;
                    db.SaveChanges();
                    db.Configuration.ValidateOnSaveEnabled = true;
                    return ActionStatus.AccountLocked;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus Register()
        {
            using (var db = new ProjectDbContext())
            {
                var accountCreationTime = DateTime.Now;
                try
                {
                    Id = Guid.NewGuid();
                    UserName = UserName;
                    Password = ComputeHash(Password, HashAlgorithmType.SHA512);
                    Email = Email;
                    ActivationEmail = Email;
                    RegistrationDate = accountCreationTime;
                    IsLocked = 0;
                    IsActivated = 0;
                    LockedDateTime = accountCreationTime;
                    RetryAttempts = null;

                    db.Users.Add(this);
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus Activate()
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var lastReq = db.ActivationRequests.Single(ar => ar.Id.ToString() == ActivationCode);
                    var dbUser = db.Users.Single(u => u.Id == lastReq.UserId);

                    if (Convert.ToBoolean(dbUser.IsActivated))
                        return ActionStatus.AccountAlreadyActivated;

                    dbUser.IsActivated = 1;

                    Id = dbUser.Id;
                    UserName = dbUser.UserName;
                    Password = dbUser.Password;
                    Email = dbUser.Email;
                    RegistrationDate = dbUser.RegistrationDate;
                    IsLocked = dbUser.IsLocked;
                    IsActivated = dbUser.IsActivated;
                    LockedDateTime = dbUser.LockedDateTime;
                    RetryAttempts = dbUser.RetryAttempts;

                    db.ActivationRequests.Remove(lastReq);
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus SendActivationLink()
        {
            using (var db = new ProjectDbContext())
            {
                var activationTime = DateTime.Now;
                var activationRequestGuid = Guid.NewGuid();

                try
                {
                    var dbUser = db.Users.Single(u => u.Email == ActivationEmail);
                    if (Convert.ToBoolean(dbUser.IsActivated))
                        return ActionStatus.AccountAlreadyActivated;

                    Id = dbUser.Id;
                    UserName = dbUser.UserName;
                    Email = dbUser.Email;

                    var sbEmailBody = new StringBuilder();
                    sbEmailBody.Append("Witaj Użytkowniku: " + UserName + ",<br/><br/>");
                    sbEmailBody.Append("Poprosiłeś o aktywację konta na naszej stronie. Aktywacji możesz dokonać poprzez wpisanie Kodu Atywacyjnego na stronie Rejestracji.");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Twój Kod Aktywacyjny:");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("<b>" + activationRequestGuid + "</b>");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Pozdrawiamy");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("Imprezy Wokół Nas");

                    var sendEmailResult = SendEmail("Imprezy Wokół Nas - Aktywacja Konta", sbEmailBody.ToString());

                    if (sendEmailResult == ActionStatus.SendingEmailFailure)
                        return sendEmailResult;
                    
                    db.ActivationRequests.Add(new ActivationRequest()
                    {
                        Id = activationRequestGuid,
                        UserId = Id,
                        ActivationRequestDateTime = activationTime
                    });
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus RemindPassword()
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var lastReq = db.RemindPasswordRequests.Single(ar => ar.Id.ToString() == RemindPasswordCode);
                    var dbUser = db.Users.Single(u => u.Id == lastReq.UserId);

                    dbUser.Password = Encryption.ComputeHash(RemindPasswordNewPassword, HashAlgorithmType.SHA512);

                    Mapper.Map(dbUser, this);

                    db.RemindPasswordRequests.Remove(lastReq);
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        public ActionStatus SendRemindPasswordRequest()
        {
            using (var db = new ProjectDbContext())
            {
                var vaerificationTime = DateTime.Now;
                var varificationRequestGuid = Guid.NewGuid();

                try
                {
                    var dbUser = db.Users.Single(u => u.Email == RemindPasswordEmail);

                    Mapper.Map(dbUser, this);

                    var sbEmailBody = new StringBuilder();
                    sbEmailBody.Append("Witaj Użytkowniku: " + UserName + ",<br/><br/>");
                    sbEmailBody.Append("Poniżej znajdziesz kod weryfikacyjny do zmiany Hasła dla Twojego konta na naszej stronie:");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Twój Kod Weryfikacyjny:");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("<b>" + varificationRequestGuid + "</b>");
                    sbEmailBody.Append("<br/><br/>");
                    sbEmailBody.Append("Pozdrawiamy");
                    sbEmailBody.Append("<br/>");
                    sbEmailBody.Append("Strona Imprezy Wokół Nas");

                    var sendEmailResult = SendEmail("Imprezy Wokół Nas - Zmiana Hasła", sbEmailBody.ToString());

                    if (sendEmailResult == ActionStatus.SendingEmailFailure)
                        return sendEmailResult;

                    db.RemindPasswordRequests.Add(new RemindPasswordRequest()
                    {
                        Id = varificationRequestGuid,
                        UserId = Id,
                        RemindPasswordRequestDateTime = vaerificationTime
                    });
                    db.SaveChanges();

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    return ActionStatus.DatabaseError;
                }
                finally
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                }
            }
        }

        private ActionStatus SendEmail(string emailSubject, string emailBody)
        {
            using (var db = new ProjectDbContext())
            {
                try
                {
                    var dbPrivateKey = db.Keys.Single(k => k.Id == "email_private");
                    var dbPublicKey = db.Keys.Single(k => k.Id == "email_public");
                    var privateKey = dbPrivateKey.Value;

                    //var xmlPath = HttpContext.Current.Server.MapPath("~/Data/Email.xml");
                    var xmlPath = $@"{AppDomain.CurrentDomain.BaseDirectory}Data\Email.xml";
                    
                    var doc = XDocument.Load(xmlPath);
                    var smtp = doc.Element("smtp");
                    var network = smtp?.Element("network");

                    var host = network?.Attribute("host")?.Value;
                    var port = Convert.ToInt32(network?.Attribute("port")?.Value);
                    var address = smtp?.Attribute("from")?.Value ?? "";
                    var userName = network?.Attribute("userName")?.Value;
                    var plainPasswordBackup = network?.Attribute("plainpasswordbackup")?.Value;
                    var password = "";

                    try
                    {
                        password = RsaDecryptWithPrivate(network?.Attribute("password")?.Value, privateKey);
                    }
                    catch (Exception)
                    {
                        if (string.IsNullOrWhiteSpace(password) && !string.IsNullOrWhiteSpace(plainPasswordBackup)) // jeśli błąd został wyrzucony podczas deszyfrowania hasła obecnymi kluczami, sprawdź czy istnieje kopia hasła w pliku XML i użyj jej
                        {
                            password = plainPasswordBackup;
                        }
                    }

                    var enableSsl = network?.Attribute("enableSsl")?.Value;

                    var keys = RsaGenerateKeys();
                    network?.SetAttributeValue("password", RsaEncryptWithPublic(password, keys.Public));
                    doc.Save(xmlPath);

                    dbPrivateKey.Value = keys.Private;
                    dbPublicKey.Value = keys.Public;
                    db.SaveChanges();

                    var mailMessage = new MailMessage(address, Email)
                    {
                        IsBodyHtml = true,
                        Body = emailBody,
                        Subject = emailSubject
                    };

                    var smtpClient = new SmtpClient(host, port)
                    {
                        Credentials = new NetworkCredential()
                        {
                            UserName = userName,
                            Password = password
                        },
                        EnableSsl = Convert.ToBoolean(enableSsl)
                    };

                    smtpClient.Send(mailMessage);

                    if (!string.IsNullOrWhiteSpace(plainPasswordBackup))
                    {
                        network?.SetAttributeValue("plainpasswordbackup", "");
                        doc.Save(xmlPath);
                    }

                    return ActionStatus.Success;
                }
                catch (Exception)
                {
                    if (db.Database.Connection.State == ConnectionState.Open)
                        db.Database.Connection.Close();
                    return ActionStatus.SendingEmailFailure;
                }
            }
        }

        public static User GetAuthenticated(bool IncludeNavigationProperties = false)
        {
            var db = new ProjectDbContext();

            var userCookie = HttpContext.Current.Request.Cookies["LoggedUser"];
            var userSession = (UserToLoginViewModel)HttpContext.Current.Session["LoggedUser"];
            var user = new User();
            UserToLoginViewModel userToLogin = null;
            if (userSession != null)
                userToLogin = userSession;
            else if (userCookie != null)
                userToLogin = JsonConvert.DeserializeObject<UserToLoginViewModel>(userCookie.Value);

            Mapper.Map(userToLogin, user);
            var authUser = user.Authenticate(true) == ActionStatus.Success
                ? userToLogin
                : null;
            
            return authUser == null 
                ? null 
                : (IncludeNavigationProperties 
                    ? db.Users.Include(u => u.Avatar).Include(u => u.ActivationRequests).Include(u => u.RemindPasswordRequests).Include(u => u.AddedToFriends).Single(u => u.Id == authUser.Id) 
                    : db.Users.Single(u => u.Id == authUser.Id));
        }

        public override bool Equals(object obj)
        {
            if (Equals(this, null) && Equals(obj, null)) return true;
            if (Equals(this, null) || Equals(obj, null)) return false;
            if (!(obj is User)) return false;
            var otherUser = (User) obj;
            return Id == otherUser.Id;
        }

        public override int GetHashCode()
        {
            return Id.GetHashCode() ^ 17 * Id.GetHashCode() ^ 29;
        }

        public static bool operator == (User u1, User u2)
        {
            return Equals(u1, u2);
        }

        public static bool operator !=(User u1, User u2)
        {
            return !(u1 == u2);
        }
    }
}
