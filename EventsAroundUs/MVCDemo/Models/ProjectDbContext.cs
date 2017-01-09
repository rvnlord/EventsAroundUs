using System;
using System.Data.Entity;
using System.ComponentModel.DataAnnotations.Schema;
using System.Linq;
using System.Reflection;
using MySql.Data.Entity;
using System.Collections.Generic;
using System.Data.Entity.Infrastructure;
using System.Data.Entity.Validation;
using System.Xml.Linq;

namespace MVCDemo.Models
{
    public class ProjectDbContext : DbContext
    {
        public ProjectDbContext() : base("name=DBCS")
        { }
        
        public virtual DbSet<User> Users { get; set; }
        public virtual DbSet<ActivationRequest> ActivationRequests { get; set; }
        public virtual DbSet<RemindPasswordRequest> RemindPasswordRequests { get; set; }
        public virtual DbSet<Key> Keys { get; set; }
        public virtual DbSet<Image> Images { get; set; }
        public virtual DbSet<IpBlock> IpBlocks { get; set; }
        public virtual DbSet<Location> Locations { get; set; }
        public virtual DbSet<Notification> Notifications { get; set; }
        public virtual DbSet<Message> Messages { get; set; }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Users

            modelBuilder.Entity<User>()
                .HasKey(e => e.Id)
                .ToTable("tblUsers");

            modelBuilder.Entity<User>()
                .Property(e => e.UserName)
                .IsUnicode(true);

            modelBuilder.Entity<User>()
                .Property(e => e.Password)
                .IsUnicode(true);

            modelBuilder.Entity<User>()
                .Property(e => e.Email)
                .IsUnicode(true);

            modelBuilder.Entity<User>()
                .HasMany(e => e.ActivationRequests)
                .WithOptional(e => e.User)
                .HasForeignKey(e => e.UserId);

            modelBuilder.Entity<User>()
                .HasMany(e => e.RemindPasswordRequests)
                .WithOptional(e => e.User)
                .HasForeignKey(e => e.UserId);

            // Friends

            modelBuilder.Entity<User>()
                .HasMany(u => u.AddedToFriends)
                .WithMany()
                .Map(u =>
                    {
                        u.MapLeftKey("UserId");
                        u.MapRightKey("FriendId");
                        u.ToTable("tblFriendRelationships");
                    });

            // ActivationRequests

            modelBuilder.Entity<ActivationRequest>()
                .HasKey(e => e.Id)
                .ToTable("tblactivationrequests");

            // RemindPasswordRequests

            modelBuilder.Entity<RemindPasswordRequest>()
                .HasKey(e => e.Id)
                .ToTable("tblremindpasswordRequests");

            // Keys

            modelBuilder.Entity<Key>()
                .HasKey(e => e.Id)
                .ToTable("tblkeys");

            modelBuilder.Entity<Key>()
                .Property(e => e.Value)
                .IsUnicode(false);

            // Images

            modelBuilder.Entity<Image>()
                .Property(e => e.ImagePath)
                .IsUnicode(false);

            modelBuilder.Entity<Image>()
                .HasMany(e => e.Users)
                .WithOptional(e => e.Avatar)
                .HasForeignKey(e => e.AvatarId);

            // IpBlocks

            modelBuilder.Entity<IpBlock>()
                .HasKey(ipbl => new { ipbl.StartIpNum, ipbl.EndIpNum });

            // Locations

            modelBuilder.Entity<Location>()
                .Property(e => e.Country)
                .IsUnicode(false);

            modelBuilder.Entity<Location>()
                .Property(e => e.City)
                .IsUnicode(false);

            modelBuilder.Entity<Location>()
                .HasMany(e => e.IpBlocks)
                .WithOptional(e => e.Location)
                .HasForeignKey(e => e.LocationId);

            // Notifications

            modelBuilder.Entity<User>()
                .HasMany(e => e.SentNotifications)
                .WithRequired(e => e.FromUser)
                .HasForeignKey(e => e.FromUserId)
                .WillCascadeOnDelete(false);

            modelBuilder.Entity<User>()
                .HasMany(e => e.ReceivedNotifications)
                .WithRequired(e => e.ToUser)
                .HasForeignKey(e => e.ToUserId)
                .WillCascadeOnDelete(false);

            // dMessages

            modelBuilder.Entity<Message>()
                .Property(e => e.Title)
                .IsUnicode(false);

            modelBuilder.Entity<Message>()
                .Property(e => e.Content)
                .IsUnicode(false);

            modelBuilder.Entity<Message>()
                .HasMany(e => e.Notifications)
                .WithRequired(e => e.Message)
                .HasForeignKey(e => e.MessageId)
                .WillCascadeOnDelete(false);
        }

        protected override DbEntityValidationResult ValidateEntity(DbEntityEntry entityEntry, IDictionary<object, object> items)
        {
            var validationReult = base.ValidateEntity(entityEntry, items);

            if (entityEntry.Entity.GetType() == typeof (User) && validationReult.ValidationErrors.Count > 0)
            {
                var propsToRemove =
                    entityEntry.Entity.GetType().GetProperties()
                        .Where(p => Attribute.IsDefined(p, typeof (NotMappedAttribute)))
                        .SelectMany(p => validationReult.ValidationErrors.Where(err => err.PropertyName == p.Name))
                        .Select(x => x.PropertyName)
                        .Distinct()
                        .ToList();

                var user = (User) entityEntry.Entity;
                if (user.Password.Length > 25)
                    propsToRemove.Add(nameof (user.Password));

                var listErrors =
                    validationReult.ValidationErrors
                        .ToLookup(key => key.PropertyName, val => val)
                        .Where(kvp => propsToRemove.Contains(kvp.Key))
                        .SelectMany(kvp => kvp)
                        .ToList();

                if (listErrors.Count(x => x.PropertyName == nameof(user.Password)) != 1)
                    listErrors.RemoveAll(x => x.PropertyName == nameof(user.Password));

                foreach (var error in listErrors)
                    validationReult.ValidationErrors.Remove(error);
            }

            return validationReult;
        }
    }
}
