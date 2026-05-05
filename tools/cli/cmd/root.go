package cmd

import (
"fmt"
"os"

"github.com/spf13/cobra"
)

var rootCmd = &cobra.Command{
Use:   "tenadam",
Short: "Tenadam Health Platform CLI",
}

func Execute() {
if err := rootCmd.Execute(); err != nil {
fmt.Fprintln(os.Stderr, err)
os.Exit(1)
}
}

func init() {
rootCmd.AddCommand(newServiceCmd())
}

func newServiceCmd() *cobra.Command {
return &cobra.Command{
Use:   "new-service [name]",
Short: "Scaffold a new Go microservice",
Args:  cobra.ExactArgs(1),
Run: func(cmd *cobra.Command, args []string) {
fmt.Printf("Scaffolding service: %s\n", args[0])
},
}
}
