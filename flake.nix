{
  description = "Mktute";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = import nixpkgs { inherit system; };
        nodejs = pkgs.nodejs_22;
      in rec {
#        packages = {
#          default = pkgs.buildNpmPackage {
#            name = "mktute";
#            src = ./.;
#            npmDepsHash = "sha256-Ej5XszF55es9ehndSJsu1rVXmT1KTBSfZkbgFJuQX/A=";
#            dontNpmInstall = false;
#            postInstall = ''
#              mkdir -p $out/bin
#              cp $src/bin/mktute.js $out/bin/mktute
#            '';
#            meta = {
#              description = "Tutorial generator for npm";
#              license = "MIT";
#            };
#          };
#        };
        devShells = {
          default = pkgs.mkShell {
            out = ".";
            packages = [ nodejs pkgs.prefetch-npm-deps pkgs.nodePackages.pnpm ];
            shellHook = "pnpm install; prefetch-npm-deps package-lock.json";
          };
        };
      });
}
