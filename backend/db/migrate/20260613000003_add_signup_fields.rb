# frozen_string_literal: true

# Columns required by sign-up (spec §8):
#   users.marketing_opt_in   — agreed to marketing emails (default false)
#   members.onboarding_complete — drives /api/v1/auth/me + post-verify routing
class AddSignupFields < ActiveRecord::Migration[7.2]
  def change
    add_column :users,   :marketing_opt_in,    :boolean, null: false, default: false
    add_column :members, :onboarding_complete, :boolean, null: false, default: false
  end
end
