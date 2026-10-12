export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      active_timer: {
        Row: {
          distracoes: number
          foco_especifico: string | null
          id: string
          iniciado_em: string
          pausado_em: string | null
          segundos_pausados: number
          skill_id: string
          user_id: string
        }
        Insert: {
          distracoes?: number
          foco_especifico?: string | null
          id?: string
          iniciado_em?: string
          pausado_em?: string | null
          segundos_pausados?: number
          skill_id: string
          user_id?: string
        }
        Update: {
          distracoes?: number
          foco_especifico?: string | null
          id?: string
          iniciado_em?: string
          pausado_em?: string | null
          segundos_pausados?: number
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "active_timer_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      areas: {
        Row: {
          arquivada: boolean
          cor: string
          criado_em: string
          descricao: string | null
          icone: string | null
          id: string
          nome: string
          ordem: number
          user_id: string
        }
        Insert: {
          arquivada?: boolean
          cor?: string
          criado_em?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome: string
          ordem?: number
          user_id?: string
        }
        Update: {
          arquivada?: boolean
          cor?: string
          criado_em?: string
          descricao?: string | null
          icone?: string | null
          id?: string
          nome?: string
          ordem?: number
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          area_id: string
          concluida_em: string | null
          criado_em: string
          criterio_de_conclusao: string | null
          id: string
          prazo: string | null
          skill_id: string | null
          status: string
          titulo: string
          user_id: string
        }
        Insert: {
          area_id: string
          concluida_em?: string | null
          criado_em?: string
          criterio_de_conclusao?: string | null
          id?: string
          prazo?: string | null
          skill_id?: string | null
          status?: string
          titulo: string
          user_id?: string
        }
        Update: {
          area_id?: string
          concluida_em?: string | null
          criado_em?: string
          criterio_de_conclusao?: string | null
          id?: string
          prazo?: string | null
          skill_id?: string | null
          status?: string
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "goals_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      habit_logs: {
        Row: {
          concluido: boolean
          data: string
          habit_id: string
          id: string
          user_id: string
        }
        Insert: {
          concluido?: boolean
          data: string
          habit_id: string
          id?: string
          user_id?: string
        }
        Update: {
          concluido?: boolean
          data?: string
          habit_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habit_logs_habit_id_fkey"
            columns: ["habit_id"]
            isOneToOne: false
            referencedRelation: "habits"
            referencedColumns: ["id"]
          },
        ]
      }
      habits: {
        Row: {
          area_id: string | null
          ativo: boolean
          dias_semana: number[] | null
          frequencia: string
          id: string
          nome: string
          ordem: number
          user_id: string
        }
        Insert: {
          area_id?: string | null
          ativo?: boolean
          dias_semana?: number[] | null
          frequencia?: string
          id?: string
          nome: string
          ordem?: number
          user_id?: string
        }
        Update: {
          area_id?: string | null
          ativo?: boolean
          dias_semana?: number[] | null
          frequencia?: string
          id?: string
          nome?: string
          ordem?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "habits_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      metric_entries: {
        Row: {
          data: string
          id: string
          metric_id: string
          observacao: string | null
          user_id: string
          valor: number
        }
        Insert: {
          data?: string
          id?: string
          metric_id: string
          observacao?: string | null
          user_id?: string
          valor: number
        }
        Update: {
          data?: string
          id?: string
          metric_id?: string
          observacao?: string | null
          user_id?: string
          valor?: number
        }
        Relationships: [
          {
            foreignKeyName: "metric_entries_metric_id_fkey"
            columns: ["metric_id"]
            isOneToOne: false
            referencedRelation: "metrics"
            referencedColumns: ["id"]
          },
        ]
      }
      metrics: {
        Row: {
          area_id: string
          arquivada: boolean
          direcao: string
          id: string
          meta_valor: number | null
          nome: string
          ordem: number
          unidade: string | null
          user_id: string
        }
        Insert: {
          area_id: string
          arquivada?: boolean
          direcao?: string
          id?: string
          meta_valor?: number | null
          nome: string
          ordem?: number
          unidade?: string | null
          user_id?: string
        }
        Update: {
          area_id?: string
          arquivada?: boolean
          direcao?: string
          id?: string
          meta_valor?: number | null
          nome?: string
          ordem?: number
          unidade?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "metrics_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          area_id: string
          data: string
          descricao: string | null
          id: string
          skill_id: string | null
          titulo: string
          user_id: string
        }
        Insert: {
          area_id: string
          data?: string
          descricao?: string | null
          id?: string
          skill_id?: string | null
          titulo: string
          user_id?: string
        }
        Update: {
          area_id?: string
          data?: string
          descricao?: string | null
          id?: string
          skill_id?: string | null
          titulo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "milestones_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      periodic_targets: {
        Row: {
          horas_alvo: number
          id: string
          periodo: string
          skill_id: string
          user_id: string
        }
        Insert: {
          horas_alvo: number
          id?: string
          periodo: string
          skill_id: string
          user_id?: string
        }
        Update: {
          horas_alvo?: number
          id?: string
          periodo?: string
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "periodic_targets_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      practice_sessions: {
        Row: {
          aprendizado: string | null
          criado_em: string
          distracoes: number
          duracao_minutos: number
          erros: string | null
          fim: string
          foco_especifico: string | null
          id: string
          inicio: string
          nota_qualidade: number
          proximo_passo: string | null
          skill_id: string
          teve_feedback: boolean
          tipo_pratica: string
          user_id: string
        }
        Insert: {
          aprendizado?: string | null
          criado_em?: string
          distracoes?: number
          duracao_minutos: number
          erros?: string | null
          fim: string
          foco_especifico?: string | null
          id?: string
          inicio: string
          nota_qualidade: number
          proximo_passo?: string | null
          skill_id: string
          teve_feedback?: boolean
          tipo_pratica?: string
          user_id?: string
        }
        Update: {
          aprendizado?: string | null
          criado_em?: string
          distracoes?: number
          duracao_minutos?: number
          erros?: string | null
          fim?: string
          foco_especifico?: string | null
          id?: string
          inicio?: string
          nota_qualidade?: number
          proximo_passo?: string | null
          skill_id?: string
          teve_feedback?: boolean
          tipo_pratica?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      quality_factors: {
        Row: {
          descricao: string | null
          fator: number
          nota: number
          user_id: string
        }
        Insert: {
          descricao?: string | null
          fator: number
          nota: number
          user_id?: string
        }
        Update: {
          descricao?: string | null
          fator?: number
          nota?: number
          user_id?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          criado_em: string
          id: string
          nota_geral: number | null
          o_que_funcionou: string | null
          onde_travei: string | null
          periodo_fim: string
          periodo_inicio: string
          prioridades_proximo_periodo: string | null
          tipo: string
          user_id: string
        }
        Insert: {
          criado_em?: string
          id?: string
          nota_geral?: number | null
          o_que_funcionou?: string | null
          onde_travei?: string | null
          periodo_fim: string
          periodo_inicio: string
          prioridades_proximo_periodo?: string | null
          tipo: string
          user_id?: string
        }
        Update: {
          criado_em?: string
          id?: string
          nota_geral?: number | null
          o_que_funcionou?: string | null
          onde_travei?: string | null
          periodo_fim?: string
          periodo_inicio?: string
          prioridades_proximo_periodo?: string | null
          tipo?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_assessments: {
        Row: {
          data: string
          id: string
          nivel: number
          observacao: string | null
          skill_id: string
          user_id: string
        }
        Insert: {
          data?: string
          id?: string
          nivel: number
          observacao?: string | null
          skill_id: string
          user_id?: string
        }
        Update: {
          data?: string
          id?: string
          nivel?: number
          observacao?: string | null
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_assessments_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_levels: {
        Row: {
          fonte_referencia: string | null
          horas_acumuladas_alvo: number
          id: string
          nome_nivel: string
          ordem: number
          skill_id: string
          user_id: string
        }
        Insert: {
          fonte_referencia?: string | null
          horas_acumuladas_alvo: number
          id?: string
          nome_nivel: string
          ordem?: number
          skill_id: string
          user_id?: string
        }
        Update: {
          fonte_referencia?: string | null
          horas_acumuladas_alvo?: number
          id?: string
          nome_nivel?: string
          ordem?: number
          skill_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_levels_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
      skills: {
        Row: {
          area_id: string
          arquivada: boolean
          criado_em: string
          descricao: string | null
          destaque_dashboard: boolean
          horas_iniciais: number
          id: string
          nivel_atual_autoavaliado: number | null
          nome: string
          ordem: number
          permite_pratica_passiva: boolean
          tipo_meta_tempo: string
          user_id: string
        }
        Insert: {
          area_id: string
          arquivada?: boolean
          criado_em?: string
          descricao?: string | null
          destaque_dashboard?: boolean
          horas_iniciais?: number
          id?: string
          nivel_atual_autoavaliado?: number | null
          nome: string
          ordem?: number
          permite_pratica_passiva?: boolean
          tipo_meta_tempo?: string
          user_id?: string
        }
        Update: {
          area_id?: string
          arquivada?: boolean
          criado_em?: string
          descricao?: string | null
          destaque_dashboard?: boolean
          horas_iniciais?: number
          id?: string
          nivel_atual_autoavaliado?: number | null
          nome?: string
          ordem?: number
          permite_pratica_passiva?: boolean
          tipo_meta_tempo?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skills_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      user_settings: {
        Row: {
          fator_pratica_passiva: number
          user_id: string
        }
        Insert: {
          fator_pratica_passiva?: number
          user_id?: string
        }
        Update: {
          fator_pratica_passiva?: number
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      practice_sessions_horas: {
        Row: {
          aprendizado: string | null
          criado_em: string | null
          data_local: string | null
          distracoes: number | null
          duracao_minutos: number | null
          erros: string | null
          fim: string | null
          foco_especifico: string | null
          horas_brutas: number | null
          horas_efetivas: number | null
          id: string | null
          inicio: string | null
          nota_qualidade: number | null
          proximo_passo: string | null
          skill_id: string | null
          teve_feedback: boolean | null
          tipo_pratica: string | null
          user_id: string | null
        }
        Relationships: [
          {
            foreignKeyName: "practice_sessions_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "skills"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      criar_fatores_padrao: { Args: { p_user_id: string }; Returns: undefined }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
