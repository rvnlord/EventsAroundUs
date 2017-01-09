using System;
using System.IO;
using System.Security.Cryptography;
using System.Text;
using MVCDemo.Common;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Encodings;
using Org.BouncyCastle.Crypto.Engines;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Prng;
using Org.BouncyCastle.OpenSsl;
using Org.BouncyCastle.Pkcs;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.X509;

namespace MVCDemo.Common
{
    public static class Encryption
    {
        // Funkcje Haszujące

        public static string ComputeHash(string plainText, HashAlgorithmType hashAlgorithm, byte[] saltBytes = null)
        {
            // Wygeneruj salt jeżeli niezostał podany
            if (saltBytes == null)
            {
                // Zdefiniuj minimalne i maksymalne wartości salt.
                const int minSaltSize = 4;
                const int maxSaltSize = 8;

                // Generuj losowe wartości dla rozmiaru saltu.
                var random = new Random();
                var saltSize = random.Next(minSaltSize, maxSaltSize);

                // Alokuj tablice bajtów do przechowywania saltu.
                saltBytes = new byte[saltSize];

                // Inicjalizuj generator  wartości losowych
                var rng = new RNGCryptoServiceProvider();

                // Wypełnij salt kryptograficznie silnymi wartościami bajtów.
                rng.GetNonZeroBytes(saltBytes);
            }

            // Konwertuj tekst na tablicę bajtów.
            var plainTextBytes = Encoding.UTF8.GetBytes(plainText);

            // Alokuj tablicę do przerchowywania wartości tekstu wraz z saltem.
            var plainTextWithSaltBytes = new byte[plainTextBytes.Length + saltBytes.Length];

            // Kopiuj bajty tekstu do wynikowej tablicy
            for (var i = 0; i < plainTextBytes.Length; i++)
                plainTextWithSaltBytes[i] = plainTextBytes[i];

            // Konkatenuj do tablicy bajty saltu
            for (var i = 0; i < saltBytes.Length; i++)
                plainTextWithSaltBytes[plainTextBytes.Length + i] = saltBytes[i];

            HashAlgorithm hash;

            // Inicjalizuj odpowiednią kjlasę dla algorytmu haszującego.
            switch (hashAlgorithm)
            {
                case HashAlgorithmType.SHA384:
                    hash = new SHA384Managed();
                    break;
                case HashAlgorithmType.SHA512:
                    hash = new SHA512Managed();
                    break;
                case HashAlgorithmType.MD5:
                    hash = new MD5CryptoServiceProvider();
                    break;
                default:
                    hash = new MD5CryptoServiceProvider();
                    break;
            }

            // Oblicz wartość hasza dla tekstu z konkatenowanym saltem
            var hashBytes = hash.ComputeHash(plainTextWithSaltBytes);

            // Utwórz tablicę do przechowywania hasza wraz z oryginalnym saltem
            var hashWithSaltBytes = new byte[hashBytes.Length +
            saltBytes.Length];

            // Kopiuj bajty hasza to tablicy
            for (var i = 0; i < hashBytes.Length; i++)
                hashWithSaltBytes[i] = hashBytes[i];

            // Dodaj do tablicy oryginalny salt
            for (var i = 0; i < saltBytes.Length; i++)
                hashWithSaltBytes[hashBytes.Length + i] = saltBytes[i];

            // Konwertuj wynik do ciągu znaków bazowanego na 64 bitowych liczbach
            var hashValue = Convert.ToBase64String(hashWithSaltBytes);

            // Zwróć wynik
            return hashValue;
        }

        public static string VerifyHash(string plainText, HashAlgorithmType hashAlgorithm, string hashValue)
        {
            // Konwertuj ciąg znaków bazowany na 64 bitowych liczbach przechowujący hasz do tablicy bajtów
            var hashWithSaltBytes = Convert.FromBase64String(hashValue);

            // Zmienna przechowująca długość hasza bez saltu
            int hashSizeInBits;
            
            // Inicjalizuj odpowiednią klasę dla algorytmu haszującego
            switch (hashAlgorithm)
            {
                case HashAlgorithmType.SHA384:
                    hashSizeInBits = 384;
                    break;
                case HashAlgorithmType.SHA512:
                    hashSizeInBits = 512;
                    break;
                case HashAlgorithmType.MD5:
                    hashSizeInBits = 128;
                    break;
                default:
                    hashSizeInBits = 128;
                    break;
            }

            // Konwertuj rozmiar hasza z bitów na bajty
            var hashSizeInBytes = hashSizeInBits / 8;

            // Upewnij się, że podany hasz ma odpowiednią długość
            if (hashWithSaltBytes.Length < hashSizeInBytes)
                return string.Empty;

            // Alokuj tablicę do przechowywania oryginalntch bajtów salta uzyskanych z hasza
            var saltBytes = new byte[hashWithSaltBytes.Length - hashSizeInBytes];

            // Kopiuj salt z końca hasza do nowej tablicy
            for (var i = 0; i < saltBytes.Length; i++)
                saltBytes[i] = hashWithSaltBytes[hashSizeInBytes + i];

            // Oblicz oczekiwany hasz
            return ComputeHash(plainText, hashAlgorithm, saltBytes);
        }

        // RSA - Generowanie Kluczy

        public static AssymetricKeys RsaGenerateKeys()
        {
            var kpgen = new RsaKeyPairGenerator();
            kpgen.Init(new KeyGenerationParameters(new SecureRandom(new CryptoApiRandomGenerator()), 1024));

            var keyPair = kpgen.GenerateKeyPair();

            var pkInfo = PrivateKeyInfoFactory.CreatePrivateKeyInfo(keyPair.Private);
            var privateKey = Convert.ToBase64String(pkInfo.GetDerEncoded());

            var info = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(keyPair.Public);
            var publicKey = Convert.ToBase64String(info.GetDerEncoded());

            return new AssymetricKeys { Private = privateKey, Public = publicKey };
        }

        public static AsymmetricCipherKeyPair RsaGenerateKeysRaw()
        {
            var kpgen = new RsaKeyPairGenerator();
            kpgen.Init(new KeyGenerationParameters(new SecureRandom(new CryptoApiRandomGenerator()), 1024));
            return kpgen.GenerateKeyPair();
        }

        // RSA - Szyfrowanie

        public static string RsaEncryptWithPublic(string plainText, string publicKey)
        {
            return RsaEncrypt(plainText, ConvertKeyToPem(publicKey, KeyType.Public));
        }

        public static string RsaEncryptWithPrivate(string plainText, string privateKey)
        {
            return RsaEncrypt(plainText, ConvertKeyToPem(privateKey, KeyType.Private));
        }

        private static string RsaEncrypt(string plainText, string key)
        {
            var bytesToEncrypt = Encoding.Unicode.GetBytes(plainText);
            var encryptEngine = new Pkcs1Encoding(new RsaEngine());

            using (var txtreader = new StringReader(key))
            {
                var keyParameter = (AsymmetricKeyParameter)new PemReader(txtreader).ReadObject();
                encryptEngine.Init(true, keyParameter);
            }

            var encrypted = Convert.ToBase64String(encryptEngine.ProcessBlock(bytesToEncrypt, 0, bytesToEncrypt.Length));
            return encrypted;
        }

        // RSA - Deszyfrowanie

        public static string RsaDecryptWithPrivate(string base64Input, string privateKey)
        {
            return RsaDecrypt(base64Input, ConvertKeyToPem(privateKey, KeyType.Private));
        }

        public static string RsaDecryptWithPublic(string base64Input, string publicKey)
        {
            return RsaDecrypt(base64Input, ConvertKeyToPem(publicKey, KeyType.Public));
        }

        private static string RsaDecrypt(string base64Input, string key)
        {
            var bytesToDecrypt = Convert.FromBase64String(base64Input);
            var decryptEngine = new Pkcs1Encoding(new RsaEngine());

            using (var txtreader = new StringReader(key))
            {
                var keyParameter = (AsymmetricKeyParameter)new PemReader(txtreader).ReadObject();
                decryptEngine.Init(false, keyParameter);
            }

            var decrypted = Encoding.Unicode.GetString(decryptEngine.ProcessBlock(bytesToDecrypt, 0, bytesToDecrypt.Length));
            return decrypted;
        }

        public static string ConvertKeyToPem(string key, KeyType keyType)
        {
            string prepend, append;
            if (keyType == KeyType.Public)
            {
                prepend = "-----BEGIN PUBLIC KEY-----\r\n";
                append = "\r\n-----END PUBLIC KEY-----";
            }
            else
            {
                prepend = "-----BEGIN PRIVATE KEY-----\r\n";
                append = "\r\n-----END PRIVATE KEY-----";
            }

            return $"{prepend}{string.Join("\r\n", key.SplitInParts(64))}{append}";
        }
    }

    public class AssymetricKeys
    {
        public string Public { get; set; }
        public string Private { get; set; }
    }

    public enum HashAlgorithmType
    {
        // ReSharper disable once InconsistentNaming
        SHA384 = 0,
        // ReSharper disable once InconsistentNaming
        SHA512 = 1,
        // ReSharper disable once InconsistentNaming
        MD5 = 2
    }

    public enum KeyType
    {
        Public,
        Private
    }
}