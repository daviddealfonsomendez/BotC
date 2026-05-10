import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, 
  Trash2, 
  Plus, 
  Info, 
  RotateCcw, 
  ChevronRight, 
  Crown, 
  Skull, 
  Shield, 
  HelpCircle,
  Eye,
  EyeOff,
  Lock,
  MoveUp,
  MoveDown,
  Layers,
  LayoutGrid,
  Search,
  Upload,
  FileJson,
  X,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Loader2,
  Edit
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Role, RoleType, EditionType, ALL_ROLES } from './data/roles';
import { getStorytellerAdvice } from './services/ai';
import { UI_TRANSLATIONS, Language } from './data/translations';

interface Player {
  id: string;
  name: string;
  roleId?: string;
  isDead: boolean;
  notes: string;
  marking?: 'possible' | 'confirmed' | 'none';
}

type AppView = 'setup' | 'script' | 'play';

interface CustomScript {
  id: string;
  name: string;
  roleIds: string[];
}

export default function App() {
  const [players, setPlayers] = useState<Player[]>([]);
  const [newName, setNewName] = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleType | 'all'>('all');
  const [editionFilter, setEditionFilter] = useState<EditionType | 'all' | string>('trouble_brewing');
  const [isGrimoireVisible, setIsGrimoireVisible] = useState(true);
  const [appView, setAppView] = useState<AppView>('setup');
  const [isPlayerMenuOpen, setIsPlayerMenuOpen] = useState(false);
  const [customRoles, setCustomRoles] = useState<Role[]>([]);
  const [activeScript, setActiveScript] = useState<string[] | null>(null);
  const [isScriptBuilderOpen, setIsScriptBuilderOpen] = useState(false);
  const [isAddRoleModalOpen, setIsAddRoleModalOpen] = useState(false);
  
  const [builderTitle, setBuilderTitle] = useState('');
  const [builderRoleIds, setBuilderRoleIds] = useState<string[]>([]);
  const [builderSearch, setBuilderSearch] = useState('');
  const [builderTab, setBuilderTab] = useState<'all' | RoleType>('all');
  const [customScripts, setCustomScripts] = useState<CustomScript[]>([]);
  const [editingScriptId, setEditingScriptId] = useState<string | null>(null);
  const [inspectedRole, setInspectedRole] = useState<Role | null>(null);
  const [isCharacterListCollapsed, setIsCharacterListCollapsed] = useState(false);
  const [isDraggingCharacter, setIsDraggingCharacter] = useState(false);
  const [privacyMode, setPrivacyMode] = useState(false);
  const longPressTimer = useRef<any>(null);
  const pressStartTime = useRef<number>(0);

  const [newRole, setNewRole] = useState<{name: string, type: RoleType, ability: string}>({
    name: '',
    type: 'townsfolk',
    ability: ''
  });

  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('botc-language');
    return (saved as Language) || 'en';
  });

  const t = UI_TRANSLATIONS[language];

  const [aiTip, setAiTip] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('botc-session');
    if (saved) {
      try {
        setPlayers(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to load session', e);
      }
    }

    const savedCustom = localStorage.getItem('botc-custom-roles');
    if (savedCustom) {
      try {
        setCustomRoles(JSON.parse(savedCustom));
      } catch (e) {
        console.error('Failed to load custom roles', e);
      }
    }
    const savedCustomScripts = localStorage.getItem('botc-custom-scripts');
    if (savedCustomScripts) {
      try {
        setCustomScripts(JSON.parse(savedCustomScripts));
      } catch (e) {
        console.error('Failed to load custom scripts', e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('botc-session', JSON.stringify(players));
  }, [players]);

  useEffect(() => {
    localStorage.setItem('botc-custom-roles', JSON.stringify(customRoles));
  }, [customRoles]);

  useEffect(() => {
    localStorage.setItem('botc-custom-scripts', JSON.stringify(customScripts));
  }, [customScripts]);

  useEffect(() => {
    localStorage.setItem('botc-language', language);
  }, [language]);

  const addPlayer = () => {
    if (!newName.trim()) return;
    const names = newName.split('\n').filter(n => n.trim());
    const newPlayers: Player[] = names.map(name => ({
      id: Math.random().toString(36).substr(2, 9),
      name: name.trim(),
      isDead: false,
      notes: ''
    }));
    setPlayers([...players, ...newPlayers]);
    setNewName('');
  };

  const removePlayer = (id: string) => {
    setPlayers(players.filter(p => p.id !== id));
    if (selectedPlayerId === id) setSelectedPlayerId(null);
  };

  const movePlayer = (index: number, direction: 'up' | 'down') => {
    const newPlayers = [...players];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= players.length) return;
    
    [newPlayers[index], newPlayers[targetIndex]] = [newPlayers[targetIndex], newPlayers[index]];
    setPlayers(newPlayers);
  };

  const assignRole = (playerId: string, roleId: string | undefined) => {
    setPlayers(players.map(p => p.id === playerId ? { ...p, roleId } : p));
  };

  const toggleDead = (id: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, isDead: !p.isDead } : p));
  };

  const resetGame = () => {
    if (confirm(t.confirmReset)) {
      setPlayers([]);
      setSelectedPlayerId(null);
    }
  };

  const updateNotes = (id: string, notes: string) => {
    setPlayers(players.map(p => p.id === id ? { ...p, notes } : p));
  };

  const saveScript = () => {
    if (!builderTitle || builderRoleIds.length === 0) return;
    
    if (editingScriptId) {
      setCustomScripts(customScripts.map(s => 
        s.id === editingScriptId 
          ? { ...s, name: builderTitle, roleIds: builderRoleIds } 
          : s
      ));
      if (editionFilter === editingScriptId) {
        setActiveScript(builderRoleIds);
      }
    } else {
      const newScript: CustomScript = {
        id: Math.random().toString(36).substr(2, 9),
        name: builderTitle,
        roleIds: builderRoleIds
      };
      setCustomScripts([...customScripts, newScript]);
      setActiveScript(builderRoleIds);
      setEditionFilter(newScript.id);
    }
    
    setIsScriptBuilderOpen(false);
    setBuilderTitle('');
    setBuilderRoleIds([]);
    setBuilderTab('all');
    setEditingScriptId(null);
  };

  const editScript = (id: string) => {
    const script = customScripts.find(s => s.id === id);
    if (!script) return;
    setBuilderTitle(script.name);
    setBuilderRoleIds(script.roleIds);
    setEditingScriptId(id);
    setIsScriptBuilderOpen(true);
  };

  const deleteScript = (id: string) => {
    if (confirm(t.delete + '?')) {
      setCustomScripts(customScripts.filter(s => s.id !== id));
      if (editionFilter === id) {
        setEditionFilter('trouble_brewing');
        setActiveScript(null);
      }
    }
  };

  const getDistribution = (count: number) => {
    const dist: Record<number, { t: number, o: number, m: number, d: number }> = {
      5: { t: 3, o: 0, m: 1, d: 1 },
      6: { t: 3, o: 1, m: 1, d: 1 },
      7: { t: 5, o: 0, m: 1, d: 1 },
      8: { t: 5, o: 1, m: 1, d: 1 },
      9: { t: 5, o: 2, m: 1, d: 1 },
      10: { t: 7, o: 0, m: 2, d: 1 },
      11: { t: 7, o: 1, m: 2, d: 1 },
      12: { t: 7, o: 2, m: 2, d: 1 },
      13: { t: 9, o: 0, m: 3, d: 1 },
      14: { t: 9, o: 1, m: 3, d: 1 },
      15: { t: 9, o: 2, m: 3, d: 1 },
    };
    if (count < 5) return { t: 0, o: 0, m: 0, d: 0 };
    if (count > 15) return dist[15];
    return dist[count] || dist[5];
  };

  const toggleRoleInBuilder = (roleId: string) => {
    setBuilderRoleIds(prev => 
      prev.includes(roleId) ? prev.filter(id => id !== roleId) : [...prev, roleId]
    );
  };

  const addManualRole = () => {
    if (!newRole.name) return;
    const roleId = newRole.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const role: Role = {
      id: roleId,
      name: newRole.name,
      type: newRole.type,
      ability: newRole.ability,
      edition: 'custom'
    };
    setCustomRoles([...customRoles, role]);
    setIsAddRoleModalOpen(false);
    setNewRole({ name: '', type: 'townsfolk', ability: '' });
  };

  const allAvailableRoles = [...ALL_ROLES, ...customRoles];

  const filteredRoles = allAvailableRoles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = roleFilter === 'all' || role.type === roleFilter;
    
    // Check if editionFilter is a system edition or a custom script ID
    const isSystemEdition = ['trouble_brewing', 'bad_moon_rising', 'sects_and_violets', 'traveler', 'fabled', 'experimental', 'custom'].includes(editionFilter);
    const matchesEdition = editionFilter === 'all' || (isSystemEdition && role.edition === editionFilter) || (!isSystemEdition && activeScript?.includes(role.id));
    
    const matchesScript = !activeScript || activeScript.includes(role.id);

    return matchesSearch && matchesType && matchesEdition && matchesScript;
  });

  const getRoleById = (id?: string) => allAvailableRoles.find(r => r.id === id);

  const getActiveRoles = () => {
    let roles: Role[] = [];
    if (activeScript) {
      roles = allAvailableRoles.filter(r => activeScript.includes(r.id));
    } else {
      if (editionFilter === 'all') roles = allAvailableRoles;
      else if (editionFilter === 'custom') roles = customRoles;
      else roles = allAvailableRoles.filter(r => r.edition === editionFilter || r.id === editionFilter);
    }
    
    const order = { townsfolk: 0, outsider: 1, minion: 2, demon: 3, traveler: 4, fabled: 5 };
    return [...roles].sort((a, b) => {
      const typeDiff = (order[a.type as keyof typeof order] || 99) - (order[b.type as keyof typeof order] || 99);
      if (typeDiff !== 0) return typeDiff;
      const nameA = language === 'es' ? (a.nameEs || a.name) : a.name;
      const nameB = language === 'es' ? (b.nameEs || b.name) : b.name;
      return nameA.localeCompare(nameB);
    });
  };

  const handleCharacterDrop = (point: { x: number, y: number }, roleId: string) => {
    const playerElements = document.querySelectorAll('[data-player-id]');
    let foundPlayerId = null;
    let minDistance = 60; // radius of search in pixels for a near-miss
    
    for (const el of Array.from(playerElements)) {
      if (!(el instanceof HTMLElement)) continue;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      // Check if point is inside the rect (exact hit)
      if (
        point.x >= rect.left &&
        point.x <= rect.right &&
        point.y >= rect.top &&
        point.y <= rect.bottom
      ) {
        foundPlayerId = el.getAttribute('data-player-id');
        break;
      }

      // Fallback: check distance to center for "near misses"
      const dist = Math.sqrt(Math.pow(point.x - centerX, 2) + Math.pow(point.y - centerY, 2));
      if (dist < minDistance) {
        minDistance = dist;
        foundPlayerId = el.getAttribute('data-player-id');
      }
    }
    
    if (foundPlayerId) {
      assignRole(foundPlayerId, roleId);
    }
  };

  const handleAiAdvice = async () => {
    setIsAiLoading(true);
    setIsAiDrawerOpen(true);
    const gameState = {
      playersCount: players.length,
      currentRoles: players.map(p => ({
        role: getRoleById(p.roleId)?.name || 'Unknown',
        type: getRoleById(p.roleId)?.type || 'Unknown',
        isDead: p.isDead
      }))
    };
    const advice = await getStorytellerAdvice(gameState);
    setAiTip(advice || "The spirits are silent...");
    setIsAiLoading(false);
  };

  const typeColors = {
    townsfolk: 'text-blue-400 border-blue-400/30 bg-blue-400/10',
    outsider: 'text-blue-200 border-blue-200/30 bg-blue-200/10',
    minion: 'text-red-400 border-red-400/30 bg-red-400/10',
    demon: 'text-red-600 border-red-600/30 bg-red-600/10',
    traveler: 'text-purple-400 border-purple-400/30 bg-purple-400/10',
    fabled: 'text-amber-500 border-amber-500/30 bg-amber-500/10',
  };

  const editions = [
    { id: 'trouble_brewing', name: t.troubleBrewing },
    { id: 'bad_moon_rising', name: t.badMoonRising },
    { id: 'sects_and_violets', name: t.sectsAndViolets },
    ...customScripts.map(s => ({ id: s.id, name: s.name })),
    { id: 'traveler', name: t.traveler },
    { id: 'fabled', name: t.fabled },
    { id: 'experimental', name: t.experimental },
    { id: 'custom', name: t.customRole },
    { id: 'all', name: t.all },
  ];

  const handleEditionFilter = (id: string) => {
    setEditionFilter(id);
    const script = customScripts.find(s => s.id === id);
    if (script) {
      setActiveScript(script.roleIds);
    } else {
      setActiveScript(null);
    }
  };

  const handlePlayerTap = (id: string) => {
    setPlayers(prev => prev.map(p => {
      if (p.id === id) {
        const currentMarking = p.marking || 'none';
        let nextMarking: Player['marking'] = 'possible';
        if (currentMarking === 'possible') nextMarking = 'confirmed';
        else if (currentMarking === 'confirmed') nextMarking = 'none';
        return { ...p, marking: nextMarking };
      }
      return p;
    }));
  };

  const handlePlayerPointerDown = (id: string) => {
    pressStartTime.current = Date.now();
    longPressTimer.current = setTimeout(() => {
      setSelectedPlayerId(id);
      setIsPlayerMenuOpen(true);
      longPressTimer.current = null;
      if (typeof window !== 'undefined' && window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50);
      }
    }, 500);
  };

  const handlePlayerPointerUp = (id: string) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
      const duration = Date.now() - pressStartTime.current;
      if (duration < 500) {
        handlePlayerTap(id);
      }
    }
  };

  const handlePlayerPointerLeave = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  const handlePlayerClick = (id: string) => {
    // Deprecated for direct tap/hold events but kept for potential generic usage
  };

  const reorderPlayers = (fromIndex: number, toIndex: number) => {
    const newPlayers = [...players];
    const [removed] = newPlayers.splice(fromIndex, 1);
    newPlayers.splice(toIndex, 0, removed);
    setPlayers(newPlayers);
  };

  return (
    <div className="min-h-screen bg-[#0a0502] text-[#e0d8d0] font-sans selection:bg-red-900 selection:text-white flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b border-white/10 p-4 backdrop-blur-md z-50 flex justify-between items-center bg-[#0a0502]/80 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-900/40 border border-red-500/50 flex items-center justify-center shadow-[0_0_15px_rgba(153,27,27,0.4)]">
            <Crown className="w-5 h-5 sm:w-6 sm:h-6 text-red-100" />
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold tracking-tight leading-none">{t.grimoireManager}</h1>
            <div className="text-[10px] uppercase font-black text-red-500/80 mt-1">
              {appView === 'setup' ? t.step1 : appView === 'script' ? t.step2 : t.step3}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-white/5 rounded-lg p-0.5 border border-white/5 mr-2">
            <button 
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${language === 'en' ? 'bg-red-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLanguage('es')}
              className={`px-2 py-1 text-[10px] font-black rounded-md transition-all ${language === 'es' ? 'bg-red-900 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}
            >
              ES
            </button>
          </div>
          {appView === 'play' && (
            <div className="flex gap-1 mr-1">
              <button 
                onClick={() => setPrivacyMode(!privacyMode)}
                className={`p-2 hover:bg-white/5 rounded-lg transition-all border ${privacyMode ? 'bg-amber-900/40 border-amber-500/50 text-amber-400' : 'border-white/5 text-white/40'}`}
                title={language === 'es' ? 'Modo Privacidad' : 'Privacy Mode'}
              >
                <Lock className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsGrimoireVisible(!isGrimoireVisible)}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors border border-white/5"
                title="Toggle Secrets Visibility"
              >
                {isGrimoireVisible ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5 opacity-50" />}
              </button>
            </div>
          )}
          {appView === 'play' && (
            <button 
              onClick={handleAiAdvice}
              className="p-2 hover:bg-blue-900/20 rounded-lg transition-all border border-blue-500/30 text-blue-400 animate-pulse-slow"
              title="Storyteller Assistant"
            >
              <Sparkles className="w-5 h-5" />
            </button>
          )}
          <button 
            onClick={resetGame}
            className="p-2 hover:bg-red-900/20 rounded-lg transition-colors border border-red-900/20 text-red-400"
            title="Reset All"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* VIEW 1: SETUP (PLAYERS) */}
        <AnimatePresence mode="wait">
          {appView === 'setup' && (
            <motion.div 
              key="setup"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col p-4 sm:p-8 max-w-2xl mx-auto w-full overflow-y-auto"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">{t.whoIsAttending}</h2>
                <p className="text-[#8e9299] text-sm">{t.enterNames}</p>
              </div>

              <div className="space-y-6">
                <div className="p-6 bg-[#1a0f0a] border border-white/5 rounded-3xl shadow-xl">
                  <label className="text-[10px] uppercase font-black tracking-widest text-red-500 mb-3 block">{t.playerList}</label>
                  <textarea
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    placeholder={t.pasteNames}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 transition-all resize-none h-40 font-medium"
                  />
                  <button 
                    onClick={addPlayer}
                    className="w-full mt-4 py-4 bg-red-900/40 hover:bg-red-800/50 text-red-100 rounded-2xl transition-all border border-red-500/30 flex items-center justify-center gap-2 text-sm font-bold uppercase tracking-widest"
                  >
                    <Plus className="w-5 h-5" /> {t.addToCircle}
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-2">
                    <span className="text-[10px] uppercase font-black text-[#8e9299] tracking-widest">{t.addedPlayers} ({players.length})</span>
                  </div>
                  <div className="grid grid-cols-1 gap-2">
                    {players.map((player, index) => (
                      <motion.div
                        key={player.id}
                        layout
                        className="flex items-center justify-between p-3 bg-white/5 border border-white/5 rounded-xl group"
                      >
                        <div className="flex items-center gap-3">
                          <span className="text-white/20 font-mono text-xs w-4">{index + 1}</span>
                          <span className="font-medium">{player.name}</span>
                        </div>
                        <button 
                          onClick={() => removePlayer(player.id)}
                          className="p-2 hover:bg-red-900/40 rounded-lg text-red-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                    {players.length === 0 && (
                      <div className="py-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-white/20 italic text-sm">
                        {t.noPlayersAdded}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-12 sticky bottom-0 bg-[#0a0502] py-4">
                <button
                  disabled={players.length < 5}
                  onClick={() => setAppView('script')}
                  className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-white/5 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-20 flex items-center justify-center gap-3"
                >
                  {t.continueToScript} <ChevronRight className="w-5 h-5" />
                </button>
                {players.length < 5 && players.length > 0 && (
                   <p className="text-center text-red-500/60 text-[10px] uppercase font-black mt-3 tracking-widest">{t.atLeast5}</p>
                )}
              </div>
            </motion.div>
          )}

          {/* VIEW 2: SCRIPT */}
          {appView === 'script' && (
            <motion.div 
              key="script"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex-1 flex flex-col p-4 sm:p-8 max-w-2xl mx-auto w-full overflow-y-auto"
            >
              <div className="mb-8 flex justify-between items-start">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-2">{t.whatAreWePlaying}</h2>
                  <p className="text-[#8e9299] text-sm">{t.selectEdition}</p>
                </div>
                <button 
                  onClick={() => setAppView('setup')}
                  className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold uppercase tracking-widest"
                >
                  {t.back}
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase font-black tracking-widest text-[#8e9299] px-1">{t.selectScript}</label>
                  <div className="relative group">
                    <select
                      value={editionFilter}
                      onChange={(e) => handleEditionFilter(e.target.value)}
                      className="w-full appearance-none bg-[#1a0f0a] border border-white/10 rounded-2xl p-5 text-lg font-bold focus:outline-none focus:border-blue-500/50 shadow-xl cursor-pointer"
                    >
                      <optgroup label={t.officialScripts}>
                        <option value="trouble_brewing">{t.troubleBrewing}</option>
                        <option value="bad_moon_rising">{t.badMoonRising}</option>
                        <option value="sects_and_violets">{t.sectsAndViolets}</option>
                      </optgroup>
                      <optgroup label={t.other}>
                        <option value="traveler">{t.traveler}</option>
                        <option value="fabled">{t.fabled}</option>
                        <option value="experimental">{t.experimental}</option>
                        <option value="custom">{t.customRolesOnly}</option>
                        <option value="all">{t.everything}</option>
                      </optgroup>
                    </select>
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                      <ChevronRight className="w-6 h-6 rotate-90" />
                    </div>
                  </div>
                </div>

                {customScripts.length > 0 && (
                  <div className="space-y-3">
                    <label className="text-[10px] uppercase font-black tracking-widest text-[#8e9299] px-1">{t.myCustomScripts}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {customScripts.map(s => (
                        <div key={s.id} className={`flex items-center justify-between p-4 rounded-2xl border transition-all ${editionFilter === s.id ? 'bg-blue-900/20 border-blue-500/50' : 'bg-black/20 border-white/5'}`}>
                          <button 
                            onClick={() => handleEditionFilter(s.id)}
                            className="flex-1 text-left font-bold text-sm"
                          >
                            {s.name}
                          </button>
                          <div className="flex gap-1">
                            <button 
                              onClick={() => editScript(s.id)} 
                              className="p-2 hover:bg-white/5 rounded-lg text-blue-400"
                              title={t.edit}
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => deleteScript(s.id)} 
                              className="p-2 hover:bg-white/5 rounded-lg text-red-500"
                              title={t.delete}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <button 
                    onClick={() => setIsScriptBuilderOpen(true)}
                    className="p-6 bg-blue-900/20 hover:bg-blue-800/30 text-blue-100 rounded-3xl transition-all border border-blue-500/30 flex flex-col items-center gap-3 text-center group"
                  >
                    <div className="p-3 bg-blue-500/20 rounded-full group-hover:scale-110 transition-transform">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">{t.buildScript}</span>
                  </button>
                  <button 
                    onClick={() => setIsAddRoleModalOpen(true)}
                    className="p-6 bg-red-900/20 hover:bg-red-800/30 text-red-100 rounded-3xl transition-all border border-red-500/30 flex flex-col items-center gap-3 text-center group"
                  >
                    <div className="p-3 bg-red-500/20 rounded-full group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-bold uppercase tracking-wider">{t.customRole}</span>
                  </button>
                </div>

                <div className="p-6 bg-white/5 border border-white/5 rounded-3xl">
                   <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xs font-black uppercase tracking-widest text-[#8e9299]">{t.previewMix}</h3>
                      <div className="px-3 py-1 bg-white/5 rounded-full border border-white/5 text-[9px] font-black uppercase tracking-widest text-white/40">
                        {players.length} {t.players || 'Players'}
                      </div>
                   </div>
                   <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(() => {
                        const dist = getDistribution(players.length);
                        return (
                          <>
                            <div className="p-3 bg-black/40 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(96,165,250,0.5)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t.townsfolk}</span>
                              </div>
                              <span className="text-xs font-black text-blue-400">{dist.t}</span>
                            </div>
                            <div className="p-3 bg-black/40 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-blue-200 rounded-full shadow-[0_0_8px_rgba(191,219,254,0.5)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t.outsider}</span>
                              </div>
                              <span className="text-xs font-black text-blue-200">{dist.o}</span>
                            </div>
                            <div className="p-3 bg-black/40 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-400 rounded-full shadow-[0_0_8px_rgba(248,113,113,0.5)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t.minion}</span>
                              </div>
                              <span className="text-xs font-black text-red-400">{dist.m}</span>
                            </div>
                            <div className="p-3 bg-black/40 rounded-xl flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="w-2 h-2 bg-red-600 rounded-full shadow-[0_0_8px_rgba(220,38,38,0.5)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest">{t.demon}</span>
                              </div>
                              <span className="text-xs font-black text-red-600">{dist.d}</span>
                            </div>
                          </>
                        );
                      })()}
                   </div>
                </div>
              </div>

              <div className="mt-12">
                <button
                  onClick={() => setAppView('play')}
                  className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-[0.2em] shadow-xl shadow-red-950/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
                >
                  {t.enterGrimoire} <Layers className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {/* VIEW 3: PLAY (GRIMOIRE) */}
          {appView === 'play' && (
            <motion.div 
              key="play"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 relative flex flex-col overflow-hidden bg-[radial-gradient(circle_at_50%_50%,#1a1008_0%,#0a0502_100%)]"
            >
              <div className="absolute inset-0 opacity-5 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')]" />
              
              {/* Simplified Character List Sidebar (Desktop) */}
              <div className="absolute left-6 top-6 bottom-32 w-56 hidden lg:flex flex-col gap-4 z-30">
                <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2.5rem] p-6 flex flex-col h-full overflow-hidden shadow-2xl">
                  <div className="shrink-0 mb-4">
                    <h3 className="text-[10px] uppercase font-black text-red-500 tracking-[0.3em] flex items-center gap-2">
                       <Sparkles className="w-3 h-3" /> {t.characters}
                    </h3>
                    <p className="text-[9px] text-[#8e9299] mt-1 leading-tight font-medium">{t.dragToAssign}</p>
                  </div>
                  
                  <div className="flex-1 overflow-y-auto custom-scrollbar -mr-2 pr-2 space-y-6">
                    {(() => {
                      const roles = getActiveRoles();
                      return ['townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'].map(type => {
                        const rolesOfType = roles.filter(r => r.type === type);
                        if (rolesOfType.length === 0) return null;
                        return (
                          <div key={type} className="space-y-2">
                            <div className={`px-2 py-1 rounded-lg bg-black/40 border-l-2 mb-2 ${typeColors[type as keyof typeof typeColors].split(' ').slice(0, 2).join(' ')}`}>
                              <span className="text-[8px] uppercase font-black tracking-[0.2em] opacity-80">
                                {language === 'es' ? (t[type as keyof typeof t] || type) : type}
                              </span>
                            </div>
                            <div className="space-y-1.5">
                               {rolesOfType.map(role => (
                                <motion.div
                                  key={role.id}
                                  onTap={() => {
                                    if (!isDraggingCharacter) {
                                      setInspectedRole(role);
                                    }
                                  }}
                                  drag
                                  dragSnapToOrigin
                                  onDragStart={() => setIsDraggingCharacter(true)}
                                  onDragEnd={(_, info) => {
                                    setIsDraggingCharacter(false);
                                    handleCharacterDrop(info.point, role.id);
                                  }}
                                  dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                                  whileDrag={{ scale: 1.1, zIndex: 50, pointerEvents: 'none' }}
                                  className={`p-2.5 rounded-xl border border-white/5 cursor-grab active:cursor-grabbing group hover:border-white/20 transition-all ${typeColors[role.type as keyof typeof typeColors].split(' ').slice(2).join(' ')}`}
                                >
                                   <div className="flex items-center gap-2.5 pointer-events-none">
                                      <div className={`w-1.5 h-1.5 rounded-full ${typeColors[role.type as keyof typeof typeColors].split(' ')[0]}`} />
                                      <div className="text-[10px] font-bold text-white group-hover:text-red-400 transition-colors truncate">
                                        {language === 'es' ? (role.nameEs || role.name) : role.name}
                                      </div>
                                   </div>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              </div>

              <div className="flex-1 flex flex-col items-center lg:justify-center p-4 sm:p-12 overflow-y-auto lg:overflow-hidden">
                <div className="relative aspect-square w-full max-w-[min(45vh,85vw)] lg:max-w-[min(85vh,90vw)] shrink-0">
                  {/* Circular Table Track */}
                  <div className="absolute inset-0 border border-white/5 rounded-full flex items-center justify-center">
                    <div className="w-[95%] h-[95%] border border-[#3d2b1f] rounded-full border-dashed opacity-30" />
                  </div>

                  {players.map((player, index) => {
                    const angle = (index / players.length) * 2 * Math.PI - Math.PI / 2;
                    const radiusX = 40; // percentage
                    const radiusY = 40; // percentage
                    const left = 50 + radiusX * Math.cos(angle);
                    const top = 50 + radiusY * Math.sin(angle);

                    const role = getRoleById(player.roleId);

                    return (
                      <motion.div
                        key={player.id}
                        data-player-id={player.id}
                        layout
                        drag
                        dragSnapToOrigin
                        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
                        onDragEnd={(_, info) => {
                          // Dragging logic for circular reordering
                          const dragX = info.point.x - (window.innerWidth / 2);
                          const dragY = info.point.y - (window.innerHeight / 2);
                          let newAngle = Math.atan2(dragY, dragX) + Math.PI / 2;
                          if (newAngle < 0) newAngle += 2 * Math.PI;
                          
                          const newIndex = Math.round((newAngle / (2 * Math.PI)) * players.length) % players.length;
                          if (newIndex !== index) {
                            reorderPlayers(index, newIndex);
                          }
                        }}
                        initial={false}
                        animate={{ left: `${left}%`, top: `${top}%` }}
                        transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center cursor-move group z-10 scale-90 sm:scale-100"
                        style={{ x: 0, y: 0 }}
                      >
                        <div 
                           onPointerDown={() => handlePlayerPointerDown(player.id)}
                           onPointerUp={() => handlePlayerPointerUp(player.id)}
                           onPointerLeave={handlePlayerPointerLeave}
                           data-player-id={player.id}
                           className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-full border-2 flex flex-col items-center justify-center transition-all shadow-xl overflow-hidden ${
                            selectedPlayerId === player.id 
                              ? 'ring-4 ring-red-500/20 scale-110 z-20 bg-[#1a0f0a]' 
                              : 'bg-[#0a0502]/80 hover:border-white/20'
                           } ${
                            player.marking === 'confirmed' 
                              ? 'border-green-500' 
                              : player.marking === 'possible' 
                                ? 'border-orange-500' 
                                : selectedPlayerId === player.id 
                                  ? 'border-red-500' 
                                  : 'border-[#3d2b1f]'
                           }`}
                        >
                          {player.isDead && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[1px]">
                              <div className="rotate-12 border border-red-900 text-red-900 font-black px-1 text-[8px] sm:text-xs uppercase">{t.executed}</div>
                            </div>
                          )}

                          <div className="flex-1 flex items-center justify-center">
                            {role && isGrimoireVisible && !privacyMode ? (
                               <div className={`text-center ${typeColors[role.type].split(' ')[0]}`}>
                                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-tighter opacity-70 leading-none">
                                    {language === 'es' ? (t[role.type as keyof typeof t] || role.type) : role.type}
                                  </span>
                               </div>
                            ) : (
                              <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8 opacity-20" />
                            )}
                          </div>

                          <div className="w-full bg-black/60 p-1 border-t border-white/10 text-center">
                            <span className={`text-[9px] sm:text-[10px] font-medium truncate px-1 block ${player.isDead ? 'opacity-30' : ''}`}>
                              {player.name}
                            </span>
                          </div>

                          {role && isGrimoireVisible && !privacyMode && (
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[10%] w-full px-1 text-center pointer-events-none">
                               <div className={`text-[8px] sm:text-[10px] font-bold uppercase truncate tracking-tight ${typeColors[role.type].split(' ')[0]}`}>
                                 {language === 'es' ? (role.nameEs || role.name) : role.name}
                               </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="absolute -top-1 sm:-top-2 flex gap-1">
                          {player.isDead && (
                            <div className="bg-red-950 p-1 rounded-full border border-red-500/50 shadow-lg">
                              <Skull className="w-2.5 h-2.5 sm:w-3 h-3 text-red-500" />
                            </div>
                          )}
                          {!isGrimoireVisible && player.roleId && (
                            <div className="bg-blue-950 p-1 rounded-full border border-blue-500/50 shadow-lg">
                              <Shield className="w-2.5 h-2.5 sm:w-3 h-3 text-blue-500" />
                            </div>
                          )}
                          {player.notes && (
                            <div className="bg-amber-950 p-1 rounded-full border border-amber-500/50 shadow-lg">
                              <Info className="w-2.5 h-2.5 sm:w-3 h-3 text-amber-500" />
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}

                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none">
                    <div className="flex flex-col items-center opacity-10 mb-4">
                      <Skull className="w-12 h-12" />
                      <span className="text-[10px] uppercase font-black tracking-[0.3em] mt-2">{language === 'es' ? 'Grimorio' : 'Grimoire'}</span>
                    </div>
                    
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-black/20 backdrop-blur-md border border-white/5 rounded-2xl p-4 flex flex-col items-center gap-2 shadow-2xl"
                    >
                      <div className="text-[8px] uppercase font-black tracking-widest text-[#8e9299] opacity-40">{t.setupCounts}</div>
                      <div className="flex gap-4">
                        {(() => {
                          const dist = getDistribution(players.length);
                          return (
                            <>
                              <div className="flex flex-col items-center">
                                 <span className="text-blue-400 font-black text-sm">{dist.t}</span>
                                 <span className="text-[7px] uppercase font-bold text-blue-400/40">{language === 'es' ? 'P' : 'T'}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                 <span className="text-blue-200 font-black text-sm">{dist.o}</span>
                                 <span className="text-[7px] uppercase font-bold text-blue-200/40">{language === 'es' ? 'F' : 'O'}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                 <span className="text-red-400 font-black text-sm">{dist.m}</span>
                                 <span className="text-[7px] uppercase font-bold text-red-400/40">{language === 'es' ? 'E' : 'M'}</span>
                              </div>
                              <div className="flex flex-col items-center">
                                 <span className="text-red-600 font-black text-sm">{dist.d}</span>
                                 <span className="text-[7px] uppercase font-bold text-red-600/40">D</span>
                              </div>
                            </>
                          )
                        })()}
                      </div>
                    </motion.div>
                  </div>
                </div>

              </div>

                {/* Simplified Character List (Mobile) */}
                <div className="lg:hidden w-full px-4 z-30 bg-[#0a0502]/80 backdrop-blur-md border-t border-white/5 shrink-0">
                   <button 
                     onClick={() => setIsCharacterListCollapsed(!isCharacterListCollapsed)}
                     className="w-full flex items-center justify-between py-3 text-[9px] uppercase font-black tracking-widest text-[#8e9299]"
                   >
                     <div className="flex items-center gap-2">
                       <LayoutGrid className="w-3 h-3" />
                       {language === 'es' ? 'Personajes' : 'Characters'}
                     </div>
                     {isCharacterListCollapsed ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                   </button>

                   <AnimatePresence>
                     {!isCharacterListCollapsed && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="space-y-4 pb-6 overflow-y-auto max-h-[40vh] custom-scrollbar"
                       >
                          {(() => {
                            const roles = getActiveRoles();
                            const types = ['townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'];
                            return types.map(type => {
                              const rolesOfType = roles.filter(r => r.type === type);
                              if (rolesOfType.length === 0) return null;
                              return (
                                <div key={type} className="space-y-2">
                                  <div className="flex items-center gap-2 px-1">
                                    <div className={`w-1 h-1 rounded-full ${typeColors[type as keyof typeof typeColors].split(' ')[0]}`} />
                                    <span className="text-[7px] uppercase font-black tracking-[0.1em] text-[#8e9299]">
                                      {language === 'es' ? (t[type as keyof typeof t] || type) : type}
                                    </span>
                                    <div className="h-px flex-1 bg-white/5" />
                                  </div>
                                  <div className="flex flex-wrap justify-center gap-2">
                                    {rolesOfType.map(role => (
                                       <motion.div
                                         key={role.id}
                                         onTap={() => {
                                           if (!isDraggingCharacter) {
                                             setInspectedRole(role);
                                           }
                                         }}
                                         drag
                                         dragSnapToOrigin
                                         onDragStart={() => setIsDraggingCharacter(true)}
                                         onDragEnd={(_, info) => {
                                           setIsDraggingCharacter(false);
                                           handleCharacterDrop(info.point, role.id);
                                         }}
                                         dragTransition={{ bounceStiffness: 600, bounceDamping: 20 }}
                                         whileDrag={{ scale: 1.2, zIndex: 100, pointerEvents: 'none' }}
                                         className={`px-3 py-1.5 rounded-full border border-white/10 bg-black/80 backdrop-blur-lg text-[8px] font-black uppercase tracking-tight shadow-xl ${typeColors[role.type as keyof typeof typeColors].split(' ').slice(0, 1).join(' ')}`}
                                       >
                                         <span className="pointer-events-none">
                                            {language === 'es' ? (role.nameEs || role.name) : role.name}
                                         </span>
                                       </motion.div>
                                    ))}
                                  </div>
                                </div>
                              );
                            });
                          })()}
                       </motion.div>
                     )}
                   </AnimatePresence>
                </div>

              {/* Bottom Nav */}
              <div className="p-4 border-t border-white/10 flex gap-2 bg-[#0a0502]/80 backdrop-blur-sm z-40">
                <button 
                  onClick={() => setAppView('setup')}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Users className="w-4 h-4" /> {t.editPlayers}
                </button>
                <button 
                  onClick={() => setAppView('script')}
                  className="flex-1 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
                >
                  <Layers className="w-4 h-4" /> {t.changeScript}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* PLAYER ACTION MODAL */}
        <AnimatePresence>
          {isPlayerMenuOpen && selectedPlayerId && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsPlayerMenuOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                className="relative w-full max-w-2xl bg-[#1a0f02] border-t sm:border border-white/10 rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
              >
                {/* Modal Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center ${
                      players.find(p => p.id === selectedPlayerId)?.isDead ? 'border-gray-700 bg-gray-900' : 'border-red-900 bg-red-950/40'
                    }`}>
                      {players.find(p => p.id === selectedPlayerId)?.isDead ? <Skull className="w-6 h-6 text-gray-500" /> : <Users className="w-6 h-6 text-red-500" />}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white leading-none mb-1">
                        {players.find(p => p.id === selectedPlayerId)?.name}
                      </h2>
                      <p className="text-[10px] uppercase font-black text-red-500 tracking-[0.2em]">{t.gameActions}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsPlayerMenuOpen(false)}
                    className="p-3 hover:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-8 pb-12 custom-scrollbar">
                   {/* Status Row */}
                   <div className="grid grid-cols-2 gap-3">
                      <button 
                        onClick={() => toggleDead(selectedPlayerId)}
                        className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-3 ${
                          players.find(p => p.id === selectedPlayerId)?.isDead 
                            ? 'bg-red-900 border-red-500 text-white shadow-lg shadow-red-900/40' 
                            : 'bg-black/40 border-white/10 text-[#8e9299]'
                        }`}
                      >
                        <Skull className="w-4 h-4" /> {players.find(p => p.id === selectedPlayerId)?.isDead ? t.resurrect : t.markDead}
                      </button>
                      <button 
                        onClick={() => assignRole(selectedPlayerId, undefined)}
                        className="py-4 bg-black/40 border border-white/10 hover:border-white/30 text-[#8e9299] rounded-2xl text-xs font-black uppercase tracking-widest transition-all"
                      >
                        {t.clearRole}
                      </button>
                   </div>

                   {/* Notes */}
                   <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black tracking-widest text-[#8e9299] px-1">{t.storytellerNotes}</label>
                      <textarea
                        value={players.find(p => p.id === selectedPlayerId)?.notes || ''}
                        onChange={(e) => updateNotes(selectedPlayerId, e.target.value)}
                        placeholder={t.addNotes}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-sm focus:outline-none focus:border-red-500/50 transition-all resize-none h-24 italic"
                      />
                   </div>

                   {/* Role Selector */}
                   <div className="space-y-4">
                      <div className="flex justify-between items-end px-1">
                        <label className="text-[10px] uppercase font-black tracking-widest text-[#8e9299]">{t.assignCharacter}</label>
                        <div className="flex gap-2">
                           {(['all', 'townsfolk', 'outsider', 'minion', 'demon'] as const).map(type => (
                             <button 
                                key={type}
                                onClick={() => setRoleFilter(type)}
                                className={`text-[9px] uppercase font-black px-2 py-1 rounded-md border ${
                                  roleFilter === type ? 'bg-white/10 border-white/30 text-white' : 'border-transparent text-[#8e9299]'
                                }`}
                             >
                               {language === 'es' ? (t[type as keyof typeof t] || type) : type}
                             </button>
                           ))}
                        </div>
                      </div>
                      
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9299]" />
                        <input 
                          type="text" 
                          placeholder={t.searchCharacters}
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="w-full bg-black/40 border border-white/10 rounded-2xl py-4 pl-10 pr-3 text-sm focus:outline-none focus:border-red-500/50"
                        />
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {filteredRoles.map(role => (
                          <button
                            key={role.id}
                            onClick={() => {
                              assignRole(selectedPlayerId, role.id);
                              setIsPlayerMenuOpen(false);
                            }}
                            className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden group ${
                              players.find(p => p.id === selectedPlayerId)?.roleId === role.id
                                ? 'bg-white border-white text-black ring-4 ring-white/10'
                                : 'bg-black/20 border-white/5 hover:border-white/20'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-1">
                              <span className="font-bold text-lg leading-tight">
                                {language === 'es' ? (role.nameEs || role.name) : role.name}
                              </span>
                              <span className={`text-[9px] uppercase font-black px-2 py-0.5 rounded-full border ${
                                players.find(p => p.id === selectedPlayerId)?.roleId === role.id
                                  ? 'border-gray-300 text-gray-500'
                                  : typeColors[role.type]
                              }`}>
                                {language === 'es' ? (t[role.type as keyof typeof t] || role.type) : role.type}
                              </span>
                            </div>
                            <p className={`text-xs leading-relaxed ${
                              players.find(p => p.id === selectedPlayerId)?.roleId === role.id ? 'text-black/60' : 'text-[#8e9299]'
                            }`}>
                              {language === 'es' ? (role.abilityEs || role.ability) : role.ability}
                            </p>
                          </button>
                        ))}
                      </div>
                   </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>

      {/* Legacy Modals (Script Builder & Add Role) */}
      <AnimatePresence>
        {isScriptBuilderOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsScriptBuilderOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-4xl bg-[#1a0f0a] border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-white/10 flex justify-between items-center bg-black/20 shrink-0">
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">{t.scriptBuilder}</h2>
                  <p className="text-[10px] uppercase font-black text-blue-500 tracking-widest">{t.customEditionConfig}</p>
                </div>
                <button onClick={() => setIsScriptBuilderOpen(false)} className="p-2 hover:bg-white/5 rounded-full"><X className="w-5 h-5" /></button>
              </div>

              <div className="p-6 flex flex-col gap-6 flex-1 overflow-hidden">
                <div className="flex flex-col gap-4 shrink-0">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] uppercase font-black text-[#8e9299]">{t.scriptTitle}</label>
                      <input 
                        type="text" 
                        value={builderTitle}
                        onChange={(e) => setBuilderTitle(e.target.value)}
                        placeholder={t.scriptPlaceholder}
                        className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-blue-500/50"
                      />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] uppercase font-black text-[#8e9299]">{t.searchChars}</label>
                       <div className="relative">
                          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8e9299]" />
                          <input 
                            type="text" 
                            value={builderSearch}
                            onChange={(e) => setBuilderSearch(e.target.value)}
                            placeholder={t.filterPool}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-4 pl-10 pr-4 text-sm focus:outline-none focus:border-blue-500/50"
                          />
                       </div>
                    </div>
                  </div>

                  <div className="flex gap-1 overflow-x-auto pb-2 custom-scrollbar">
                    <button 
                      onClick={() => setBuilderTab('all')}
                      className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all border ${builderTab === 'all' ? 'bg-white text-black border-white' : 'bg-white/5 text-[#8e9299] border-white/5 hover:border-white/10'}`}
                    >
                      {t.all}
                    </button>
                    {(['townsfolk', 'outsider', 'minion', 'demon'] as const).map(type => (
                      <button 
                        key={type}
                        onClick={() => setBuilderTab(type)}
                        className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all border ${builderTab === type ? 'bg-white text-black border-white' : 'bg-white/5 text-[#8e9299] border-white/5 hover:border-white/10'}`}
                      >
                        {t[type as keyof typeof t]}
                      </button>
                    ))}
                    <button 
                      onClick={() => setBuilderTab('traveler')} // We'll handle others separately or group them
                      className={`px-4 py-2 rounded-xl text-[10px] uppercase font-black tracking-widest whitespace-nowrap transition-all border ${builderTab === 'traveler' || builderTab === 'fabled' ? 'bg-white text-black border-white' : 'bg-white/5 text-[#8e9299] border-white/5 hover:border-white/10'}`}
                    >
                      {t.other}
                    </button>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 p-1 custom-scrollbar content-start">
                  {allAvailableRoles.filter(r => {
                    const matchesSearch = r.name.toLowerCase().includes(builderSearch.toLowerCase()) || 
                                        (r.nameEs && r.nameEs.toLowerCase().includes(builderSearch.toLowerCase()));
                    
                    let matchesTab = true;
                    if (builderTab !== 'all') {
                      if (builderTab === 'traveler') {
                        matchesTab = r.type === 'traveler' || r.type === 'fabled';
                      } else {
                        matchesTab = r.type === builderTab;
                      }
                    }
                    
                    return matchesSearch && matchesTab;
                  }).map(role => (
                    <button
                      key={role.id}
                      onClick={() => toggleRoleInBuilder(role.id)}
                      className={`p-4 rounded-2xl border text-left transition-all flex flex-col gap-1 ${
                        builderRoleIds.includes(role.id) 
                          ? 'bg-blue-900/20 border-blue-500 text-blue-100' 
                          : 'bg-black/20 border-white/5 hover:border-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-sm">
                          {language === 'es' ? (role.nameEs || role.name) : role.name}
                        </span>
                        {builderRoleIds.includes(role.id) && <Plus className="w-3 h-3 rotate-45" />}
                      </div>
                      <span className="text-[9px] uppercase font-black opacity-50">
                        {language === 'es' ? (t[role.type as keyof typeof t] || role.type) : role.type}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-6 border-t border-white/10 flex justify-between items-center bg-black/20 -mx-6 -mb-6 p-6 shrink-0">
                   <div className="text-xs font-medium text-[#8e9299]">
                     <span className="text-white font-bold">{builderRoleIds.length}</span> {t.charactersSelected}
                   </div>
                   <button 
                     onClick={saveScript}
                     disabled={!builderTitle || builderRoleIds.length === 0}
                     className="px-8 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest disabled:opacity-30 shadow-lg shadow-blue-900/20"
                   >
                     {t.saveScript}
                   </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}

        {isAddRoleModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAddRoleModalOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="relative w-full max-w-lg bg-[#1a0f0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{t.createCustomRole}</h2>
                <p className="text-[10px] uppercase font-black text-red-500 tracking-widest">{t.experimentalPool}</p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[#8e9299]">{t.characterName}</label>
                  <input 
                    type="text" 
                    value={newRole.name}
                    onChange={(e) => setNewRole({...newRole, name: e.target.value})}
                    placeholder={t.characterPlaceholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm focus:outline-none focus:border-red-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[#8e9299]">{t.roleType}</label>
                  <div className="grid grid-cols-2 gap-2">
                    {(['townsfolk', 'outsider', 'minion', 'demon', 'traveler', 'fabled'] as const).map(type => (
                      <button
                        key={type}
                        onClick={() => setNewRole({...newRole, type})}
                        className={`py-3 rounded-xl border text-[10px] uppercase font-black transition-all ${
                          newRole.type === type 
                            ? 'bg-red-900/20 border-red-500 text-red-100' 
                            : 'bg-black/20 border-white/5 text-[#8e9299]'
                        }`}
                      >
                        {language === 'es' ? (t[type as keyof typeof t] || type) : type}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-[#8e9299]">{t.abilityDescription}</label>
                  <textarea 
                    value={newRole.ability}
                    onChange={(e) => setNewRole({...newRole, ability: e.target.value})}
                    placeholder={t.abilityPlaceholder}
                    className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-sm h-32 focus:outline-none focus:border-red-500/50 resize-none"
                  />
                </div>
              </div>

              <button 
                onClick={addManualRole}
                className="w-full py-4 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-red-950/30 active:scale-95 transition-all"
              >
                {t.summonCharacter}
              </button>
            </motion.div>
          </div>
        )}

        {/* AI Assistant Drawer */}
        <AnimatePresence>
          {inspectedRole && (
            <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setInspectedRole(null)}
                className="absolute inset-0 bg-black/80 backdrop-blur-md"
              />
              <motion.div 
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                className="relative w-full max-w-sm bg-[#1a0f0a] border border-white/10 rounded-[2.5rem] p-8 shadow-2xl overflow-hidden"
              >
                <div className={`absolute top-0 left-0 w-full h-1.5 ${typeColors[inspectedRole.type as keyof typeof typeColors].split(' ')[0]}`} />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <div className={`w-2 h-2 rounded-full ${typeColors[inspectedRole.type as keyof typeof typeColors].split(' ')[0]}`} />
                      <span className="text-[10px] uppercase font-black tracking-[0.2em] text-[#8e9299]">
                        {language === 'es' ? (t[inspectedRole.type as keyof typeof t] || inspectedRole.type) : inspectedRole.type}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black text-white tracking-tight">
                      {language === 'es' ? (inspectedRole.nameEs || inspectedRole.name) : inspectedRole.name}
                    </h2>
                  </div>
                  <button 
                    onClick={() => setInspectedRole(null)}
                    className="p-2 hover:bg-white/5 rounded-full text-white/40 hover:text-white"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div className="p-5 bg-black/40 rounded-2xl border border-white/5">
                    <label className="text-[9px] uppercase font-black tracking-widest text-red-500/80 mb-3 block">
                      {t.abilityDescription}
                    </label>
                    <p className="text-sm text-white/90 leading-relaxed font-medium">
                      {language === 'es' ? (inspectedRole.abilityEs || inspectedRole.ability) : inspectedRole.ability}
                    </p>
                  </div>

                  <button 
                    onClick={() => setInspectedRole(null)}
                    className="w-full py-4 bg-white text-black rounded-2xl font-black uppercase tracking-widest active:scale-95 transition-all text-sm"
                  >
                    {t.back}
                  </button>
                </div>
              </motion.div>
            </div>
          )}

          {isAiDrawerOpen && (
            <div className="fixed inset-0 z-[110] flex items-end justify-center p-0 sm:p-4 pointer-events-none">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsAiDrawerOpen(false)}
                className="absolute inset-0 bg-black/40 backdrop-blur-[2px] pointer-events-auto"
              />
              <motion.div 
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                className="relative w-full max-w-xl bg-blue-950/95 border border-blue-500/30 rounded-t-[2.5rem] sm:rounded-[2.5rem] p-8 shadow-2xl pointer-events-auto overflow-hidden"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl font-bold text-blue-100 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-blue-400" />
                      {t.oracleAssistant}
                    </h2>
                    <p className="text-[10px] uppercase font-black text-blue-400 tracking-[0.2em] mt-1">{t.experimentalAdvice}</p>
                  </div>
                  <button 
                    onClick={() => setIsAiDrawerOpen(false)}
                    className="p-2 hover:bg-white/5 rounded-full text-blue-200"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="min-h-[100px] flex items-center justify-center p-6 bg-black/40 rounded-2xl border border-blue-500/10">
                  {isAiLoading ? (
                    <div className="flex flex-col items-center gap-3">
                      <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
                      <span className="text-xs font-bold text-blue-300 uppercase tracking-widest animate-pulse">{t.consultingMadness}</span>
                    </div>
                  ) : (
                    <p className="text-sm text-blue-50/90 leading-relaxed italic text-center">
                      "{aiTip}"
                    </p>
                  )}
                </div>

                <div className="mt-6 text-center">
                  <p className="text-[10px] text-blue-300/40 uppercase font-bold tracking-widest">
                    {t.poweredBy}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </AnimatePresence>
    </div>
  );
}

const styleTag = typeof document !== 'undefined' ? document.createElement('style') : null;
if (styleTag) {
  styleTag.textContent = `
    .custom-scrollbar::-webkit-scrollbar {
      width: 6px;
    }
    .custom-scrollbar::-webkit-scrollbar-track {
      background: transparent;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 10px;
      border: 2px solid transparent;
      background-clip: padding-box;
    }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover {
      background: rgba(255, 255, 255, 0.2);
    }
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.7; transform: scale(0.95); }
    }
    .animate-pulse-slow {
      animation: pulse-slow 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    }
  `;
  document.head.appendChild(styleTag);
}
