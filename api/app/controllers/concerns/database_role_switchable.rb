# frozen_string_literal: true

module DatabaseRoleSwitchable
  private

  def force_database_writing_role(&block)
    ActiveRecord::Base.connected_to(role: :writing, &block)
  end
end
