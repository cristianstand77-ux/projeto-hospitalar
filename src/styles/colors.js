// src/styles/colors.js

export const Colors = {

  // 60% — Pretos e cinzas escuros (fundos, superfícies, containers)
  black: {
    pure:      '#000000',  // fundo principal do app
    rich:      '#0A0A0A',  // fundo de cards
    soft:      '#111111',  // fundo de modais
    muted:     '#1A1A1A',  // superfícies elevadas
    surface:   '#222222',  // bordas e separadores
    subtle:    '#2E2E2E',  // elementos desabilitados
  },

  // 30% — Azuis (ação, destaque, interação)
  blue: {
    primary:   '#1565C0',  // botões principais, ícones ativos
    strong:    '#1976D2',  // hover de botões
    medium:    '#1E88E5',  // links, destaques
    light:     '#42A5F5',  // badges, tags
    pale:      '#90CAF9',  // textos secundários em fundo escuro
    accent:    '#0D47A1',  // sombra e profundidade
  },

  // 10% — Brancos e cinzas claros (textos, ícones, contrastes)
  white: {
    pure:      '#FFFFFF',  // texto principal sobre fundo escuro
    soft:      '#F5F5F5',  // texto secundário
    muted:     '#BDBDBD',  // texto desabilitado / placeholder
    ghost:     '#757575',  // ícones inativos
  },

  // Semânticas (status de lotação — usadas nos marcadores do mapa)
  status: {
    free:      '#4CAF50',  // lotação baixa (0–40%)
    moderate:  '#FFC107',  // lotação média (41–70%)
    busy:      '#F44336',  // lotação alta (71–100%)
  },

};

export default Colors;