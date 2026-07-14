/*Ini query untuk Kalo ada yg error, nanti version ini tinggal di samakan aja*/
UPDATE schema_migrations SET dirty = false, version = 13;


delete from pengantin;
delete from ucapan_terimakasih;
delete from orang_tua_pengantin;
delete from love_story;
delete from contact_person;
delete from galeri_pengantin;
delete from jadwal_acara;
delete from acara;