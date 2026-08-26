-- =============================================================================
-- RADYEX — Semilla del catálogo de estudios
-- =============================================================================
-- PROPUESTA, NO APLICADA. Depende de 20260824120000_esquema_inicial.sql.
--
-- Esto NO es dato de pacientes: es el catálogo fijo de estudios/paquetes que
-- hoy vive hardcodeado en `radyex-web/lib/data.ts` (STUDY_CATEGORIES,
-- TOMOGRAFIA_FOV, PAQUETES), transcrito 1:1 de docs/orden-de-estudio.md. Se
-- versiona junto con el esquema porque el formulario de "nueva orden" no
-- funciona sin él.
-- =============================================================================

insert into public.categorias_estudio (id, etiqueta, orden_visual) values
  ('intraorales',   'Radiografías intraorales',                  1),
  ('extraorales',   'Radiografías extraorales',                  2),
  ('fotografias',   'Fotografías (intraoral / extraoral)',       3),
  ('modelos',       'Modelos',                                   4),
  ('cefalometria',  'Cefalometría computarizada',                5),
  ('tomografia',    'Tomografía 3D',                              6);

insert into public.catalogo_estudios
  (id, categoria_id, etiqueta, requiere_dientes, requiere_nota, requiere_fov, entrega_fisica, orden_visual)
values
  -- Radiografías intraorales
  ('periapical',     'intraorales', 'Periapical',          true,  false, false, 'si_rx',  1),
  ('oclusal',        'intraorales', 'Oclusal',              false, false, false, 'siempre', 2),
  ('superior',       'intraorales', 'Superior',             false, false, false, 'siempre', 3),
  ('inferior',       'intraorales', 'Inferior',             false, false, false, 'siempre', 4),
  ('aleta',          'intraorales', 'Aleta de mordida',     false, false, false, 'siempre', 5),

  -- Radiografías extraorales (ninguna es de entrega física)
  ('panoramica',     'extraorales', 'Panorámica',                          false, false, false, null, 1),
  ('lateral-craneo', 'extraorales', 'Lateral de cráneo',                   false, false, false, null, 2),
  ('full-lateral',   'extraorales', 'Full lateral',                        false, false, false, null, 3),
  ('carpal',         'extraorales', 'Carpal',                              false, false, false, null, 4),
  ('pa-craneo',      'extraorales', 'P.A. de cráneo',                      false, false, false, null, 5),
  ('ap-craneo',      'extraorales', 'A.P. de cráneo',                      false, false, false, null, 6),
  ('waters',         'extraorales', 'Waters',                              false, false, false, null, 7),
  ('atm',            'extraorales', 'A.T.M.',                              false, false, false, null, 8),
  ('towne',          'extraorales', 'Towne',                               false, false, false, null, 9),
  ('hirtz',          'extraorales', 'Hirtz',                               false, false, false, null, 10),
  ('senos',          'extraorales', 'Senos paranasales (Cadwell)',         false, false, false, null, 11),
  ('anteposterior',  'extraorales', 'Anteposterior',                       false, false, false, null, 12),

  -- Fotografías
  ('foto-papel',     'fotografias', 'Papel fotográfico',   false, false, false, 'siempre', 1),
  ('foto-digital',   'fotografias', 'Digital',              false, false, false, null,      2),

  -- Modelos
  ('modelo-estudio',      'modelos', 'Estudio',                                     false, false, false, 'siempre', 1),
  ('modelo-trabajo',      'modelos', 'Trabajo',                                     false, false, false, 'siempre', 2),
  ('modelo-3d',           'modelos', 'Impreso 3D',                                  false, false, false, null,      3),
  ('escaneo-intraoral',   'modelos', 'Escaneo intraoral (3Shape / Invisalign)',     false, false, false, null,      4),

  -- Cefalometría computarizada
  ('cef-ricketts',           'cefalometria', 'Ricketts',                        false, false, false, null, 1),
  ('cef-steiner',            'cefalometria', 'Steiner',                         false, false, false, null, 2),
  ('cef-macnamara',          'cefalometria', 'Mac Namara',                      false, false, false, null, 3),
  ('cef-tweed',              'cefalometria', 'Tweed',                           false, false, false, null, 4),
  ('cef-jarabak',            'cefalometria', 'Jarabak',                         false, false, false, null, 5),
  ('cef-rothjarabak',        'cefalometria', 'Roth-Jarabak',                    false, false, false, null, 6),
  ('cef-downs',              'cefalometria', 'Downs',                           false, false, false, null, 7),
  ('cef-ricketts-resumido',  'cefalometria', 'Ricketts resumido',               false, false, false, null, 8),
  ('cef-pa-craneo',          'cefalometria', 'Cefalometría P.A. de cráneo',     false, false, false, null, 9),
  ('cef-otro',               'cefalometria', 'Otro',                            false, true,  false, null, 10),

  -- Tomografía 3D: un solo estudio "paraguas"; el FOV específico se guarda
  -- por orden en orden_estudios.fov (ver catalogo_fov más abajo).
  ('tomografia-3d', 'tomografia', 'Tomografía 3D', false, false, true, null, 1);

insert into public.catalogo_fov (value, etiqueta, ayuda, requiere_zona) values
  ('16x9', '16 × 9', 'Óptimo para Dx de sinusitis y A.T.M.',                        false),
  ('12x9', '12 × 9', 'Óptimo para cubrir todo el arco dental',                      false),
  ('8x9',  '8 × 9',  'Óptimo para selección de arco izquierdo, derecho y central',  false),
  ('8x5',  '8 × 5',  'Óptimo para cubrir arco superior o inferior',                 false),
  ('5x5',  '5 × 5',  'Óptimo para cubrir de 3 a 4 dientes',                         true);

insert into public.paquetes (id, etiqueta, descripcion, fov, nota, entrega_fisica_extra) values
  ('ortodoncia', 'Ortodoncia',
    'Panorámica + lateral de cráneo + cefalometría + fotografías + modelos',
    null, null, null),
  ('diagnostico', 'Diagnóstico',
    'Panorámica + fotografías + modelos',
    null, null, null),
  ('implantologia', 'Implantología',
    'Tomografía + guía quirúrgica (diseño e impresión) + modelos + escaneos 3D',
    '12x9',
    'Incluye diseño e impresión de guía quirúrgica (lo coordina Radyex).',
    array['Guía quirúrgica']);

insert into public.paquete_estudios (paquete_id, estudio_id) values
  ('ortodoncia', 'panoramica'),
  ('ortodoncia', 'lateral-craneo'),
  ('ortodoncia', 'cef-ricketts'),
  ('ortodoncia', 'foto-digital'),
  ('ortodoncia', 'modelo-estudio'),
  ('ortodoncia', 'modelo-trabajo'),

  ('diagnostico', 'panoramica'),
  ('diagnostico', 'foto-digital'),
  ('diagnostico', 'modelo-estudio'),
  ('diagnostico', 'modelo-trabajo'),

  ('implantologia', 'modelo-estudio'),
  ('implantologia', 'modelo-trabajo'),
  -- Implantología también implica Tomografía 3D (paquetes.fov = '12x9'),
  -- pero tomografia-3d no se agrega aquí porque paquete_estudios modela
  -- estudios de checkbox simple, y tomografía requiere fijar el FOV — el
  -- front debe marcar 'tomografia-3d' + fov='12x9' explícitamente al
  -- aplicar este paquete, igual que hace hoy PAQUETES.fov en lib/data.ts.
  ('implantologia', 'escaneo-intraoral');
