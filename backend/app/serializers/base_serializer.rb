# Shared Blueprinter base. Feature serializers inherit and add their own fields.
class BaseSerializer < Blueprinter::Base
  identifier :id
end
