using AutoMapper;

namespace MVCDemo.Models
{
    public static class AutoMapperConfiguration
    {
        public static IMapper Mapper { get; set; }

        public static void Configure()
        {
            var config = new MapperConfiguration(ConfigureUserMapping);
            Mapper = config.CreateMapper();
        }

        private static void ConfigureUserMapping(IMapperConfigurationExpression cfg)
        {
            cfg.CreateMap<UserToRegisterViewModel, User>();
            cfg.CreateMap<UserToLoginViewModel, User>();
            cfg.CreateMap<User, UserToLoginViewModel>();
            cfg.CreateMap<UserToActivateViewModel, User>();
            cfg.CreateMap<UserToRemindPasswordViewModel, User>();
            cfg.CreateMap<UserToSendActivationCodeViewModel, User>();
            cfg.CreateMap<UserToSendRemindPasswordRequestViewModel, User>();
            cfg.CreateMap<User, User>()
                .ForMember(x => x.AddedToFriends, opt => opt.Ignore())
                .ForMember(x => x.AddedAsFriendBy, opt => opt.Ignore())
                .ForMember(x => x.ActivationRequests, opt => opt.Ignore())
                .ForMember(x => x.RemindPasswordRequests, opt => opt.Ignore())
                .ForMember(x => x.ReceivedNotifications, opt => opt.Ignore())
                .ForMember(x => x.SentNotifications, opt => opt.Ignore());
            cfg.CreateMap<User, UserToEditViewModel>();
        }
    }
}
