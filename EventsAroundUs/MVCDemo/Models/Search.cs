using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using MVCDemo.Common;
using System.ComponentModel;
using System.Web.Mvc;
using System.Reflection;

namespace MVCDemo.Models
{
    [Serializable]
    public class Search
    {
        private string _searchTerm;

        [RegularExpression(@"^[a-zA-Z ĄąĆćĘęŁłŃńÓóŚśŹźŻż]*$", ErrorMessage = "Wyszukiwane frazy mogą skłądać się wyłącznie z liter. ")]
        [MinFirstStringLength(3, ' ', ErrorMessage = "Wyszukiwane frazy muszą mieć co najmniej 3 znaki. ")]
        [DisplayName("Szukaj osób")]
        public string SearchTerm
        {
            get { return !string.IsNullOrWhiteSpace(_searchTerm) ? _searchTerm : string.Empty; }
            set { _searchTerm = value; }
        }

        public Search()
        {
            SearchTerm = string.Empty;
        }

        public Search(string searchTerm)
        {
            SearchTerm = searchTerm;
        }

        public override bool Equals(object obj)
        {
            var search = obj as Search;
            if (search == null)
                return false;

            var newSearch = search;

            return _searchTerm == newSearch.SearchTerm;
        }

        public override int GetHashCode()
        { 
            return _searchTerm.GetHashCode() ^ 17;
        }
    }
}