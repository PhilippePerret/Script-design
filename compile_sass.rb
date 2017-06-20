#!/usr/bin/env ruby
# encoding: UTF-8

require 'sass'


class SASSFile

  SASS_OPTIONS = {
    line_comments:  false,
    syntax:         :sass,
    style:          :compressed
  }

  attr_reader :path
  def initialize path
    @path = path
  end

  def compile_if_necessary
    return false unless out_of_date?
    compile
  end

  def affixe
    @affixe ||= File.basename(path, File.extname(path))
  end

  def compile
    STDOUT.write "* Compilation de #{path}…"
    Sass.compile_file(path, css_path, SASS_OPTIONS)
    puts " OK"
    return true
  end
  # Retourne true si le fichier est out-of-date
  def out_of_date?
    !File.exist?(css_path) || css_ctime < sass_ctime || imports_out_of_date?
  end

  # Retourne true si le fichier contient des imports et que ces imports sont
  # moins vieux que le fichier css.
  def imports_out_of_date?
    return false unless imports?
    # Le fichier contient des imports, il faut les checker
    puts "Le fichier contient des @import(s) qu'il faut checker"
    imports.each do |import|
      if File.stat(File.join(folder, "_#{import}.sass")).ctime > css_ctime
        puts "= Le fichier #{File.join(folder, import)} est plus récent que le fichier #{css_path} => actualisation nécessaire"
        return true
      end
    end
    return false
  end

  def css_ctime
    @css_ctime ||= File.stat(css_path).ctime
  end
  def sass_ctime
    @sass_ctime ||= File.stat(path).ctime
  end

  # {Array de String} Liste des paths relatifs des fichiers importés
  # dans le sass à traiter.
  def imports
    @imports ||= code.scan(/^@import(.*?)$/).to_a.collect{|arr| arr[0].strip}
  end
  # Retourne true si le fichier contient des imports
  def imports?
    code.match(/@import /)
  end
  def code
    @code ||= File.read(path)
  end

  # Le path du fichier final
  def css_path
    if File.exist? File.join(main_folder, 'css')
      File.join(main_folder, 'css', "#{affixe}.css")
    else
      File.join(folder, "#{affixe}.css")
    end
  end
  def folder
    @folder ||= File.dirname(path)
  end
  # Le dossier contenant le dossier (celui, qui contiendra par exemple
  # un dossier CSS dans lequel il faudra mettre le fichier compilé)
  def main_folder
    @main_folder ||= File.dirname(folder)
  end
end



puts "* Compilation des SASS *"
# On cherche tous les .sass et on les compile en .css s'ils doivent
# être actualisés
nombre_compiled = 0
Dir["./**/*.sass"].each do |fpath|
  if SASSFile.new(fpath).compile_if_necessary
    nombre_compiled += 1
  end
end

if 0 === nombre_compiled
  puts "    = Aucun fichier SASS n'a eu besoin d'être compilé"
end
puts ""
