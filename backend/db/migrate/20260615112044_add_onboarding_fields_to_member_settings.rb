# frozen_string_literal: true

# Onboarding briefing + interests fields (spec §8). Stored on member_settings
# per the plan's lean data-model decision (not the design-ref briefing_settings).
class AddOnboardingFieldsToMemberSettings < ActiveRecord::Migration[7.2]
  def change
    change_table :member_settings, bulk: true do |t|
      t.string :home_postcode, limit: 10
      t.text   :work_address
      t.string :commute_mode, limit: 10
      t.string :news_topics, array: true, default: [], null: false
      t.string :interests,   array: true, default: [], null: false
    end

    add_check_constraint :member_settings,
                         "commute_mode IS NULL OR commute_mode IN ('drive','transit','cycle','walk')",
                         name: 'chk_member_settings_commute_mode'
  end
end
