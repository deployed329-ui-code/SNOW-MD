import menuCmd from './menu.js';
import pingCmd from './ping.js';
import botinfoCmd from './botinfo.js';
import kickCmd from './kick.js';
import kickallCmd from './kickall.js';
import tagallCmd from './tagall.js';
import tagCmd from './tag.js';
import sudoaddCmd from './sudoadd.js';
import sudodelCmd from './sudodel.js';
import sudolistCmd from './sudolist.js';
import ownerCmd from './owner.js';
import modeCmd from './mode.js';
import autoreactCmd from './autoreact.js';
import welcomeCmd from './welcome.js';
import devCmd from './dev.js';
import antipromoteCmd from './antipromote.js';
import antikickCmd from './antikick.js';
import antidemoteCmd from './antidemote.js';

export default {
  menu: menuCmd,
  ping: pingCmd,
  botinfo: botinfoCmd,
  kick: kickCmd,
  kickall: kickallCmd,
  tagall: tagallCmd,
  tag: tagCmd,
  sudoadd: sudoaddCmd,
  sudodel: sudodelCmd,
  sudolist: sudolistCmd,
  owner: ownerCmd,
  mode: modeCmd,
  autoreact: autoreactCmd,
  welcome: welcomeCmd,
  dev: devCmd,
  antipromote: antipromoteCmd,
  antikick: antikickCmd,
  antidemote: antidemoteCmd
  
};
